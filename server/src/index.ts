// server/src/index.ts
import express, { Request, Response } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import cors from "cors";
import dotenv from "dotenv";

const ssmClient = new SSMClient({
  region: "eu-central-1",
});

async function getParameter(name: string): Promise<string> {
  const command = new GetParameterCommand({
    Name: name,
    WithDecryption: true,
  });

  const response = await ssmClient.send(command);
  if (!response.Parameter?.Value) {
    throw new Error(`Parameter ${name} not found`);
  }
  return response.Parameter.Value;
}

const app = express();

dotenv.config();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

async function startServer() {
  try {
    // Get parameters from SSM
    const accessKeyId = await getParameter("/silkstream/aws-access-key-id");
    const secretAccessKey = await getParameter(
      "/silkstream/aws-secret-access-key"
    );
    const bucketName = await getParameter("/silkstream/bucket-name");

    const s3Client = new S3Client({
      region: process.env.AWS_REGION || "eu-central-1",
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    app.post(
      "/api/get-upload-url",
      async (req: Request, res: Response): Promise<any> => {
        try {
          console.log("Received request:", req.body);
          const { fileName, fileType } = req.body;

          if (!fileName || !fileType) {
            console.log("Missing required fields:", { fileName, fileType });
            return res
              .status(400)
              .json({ error: "Missing fileName or fileType" });
          }

          const key = `uploads/${Date.now()}-${fileName}`;
          console.log("Generating signed URL for:", { key, fileType });

          const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            ContentType: fileType,
          });

          const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600,
          });
          console.log("Successfully generated signed URL");

          res.json({
            url: signedUrl,
            key,
          });
        } catch (error) {
          console.error("Detailed error:", error);
          res.status(500).json({
            error: "Failed to generate upload URL",
            details: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    );

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Successfully loaded parameters from SSM");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
