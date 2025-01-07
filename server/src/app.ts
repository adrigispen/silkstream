import express from "express";
import cors from "cors";
import { createVideoRouter } from "./routes/videoRoutes";
import { initializeAwsServices } from "./config/aws";

// Create and export the Express app
export const createApp = async () => {
  const awsServices = await initializeAwsServices();
  const app = express();

  app.use(
    cors({
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
    })
  );

  app.use(express.json());

  const router = createVideoRouter(awsServices);
  app.use("/api", router);
  app.use("/", router); // Also mount at root for Lambda

  // Add error handling
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
};
