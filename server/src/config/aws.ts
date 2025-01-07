// src/config/aws.ts
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { fromIni } from "@aws-sdk/credential-providers";

const getLocalCredentials = () => {
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return {};
  }
  return {
    credentials: fromIni({ profile: "personal" }),
  };
};

const config = {
  region: "eu-central-1",
  ...getLocalCredentials(),
};

// Initialize SSM Client
const ssmClient = new SSMClient(config);

// Function to get parameter from SSM
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

// Initialize all AWS services
export async function initializeAwsServices() {
  // Get parameters from SSM
  const accessKeyId = await getParameter("/silkstream/aws-access-key-id");
  const secretAccessKey = await getParameter(
    "/silkstream/aws-secret-access-key"
  );
  const bucketName = await getParameter("/silkstream/bucket-name");

  const credentials = {
    accessKeyId,
    secretAccessKey,
  };

  const s3Client = new S3Client({
    region: "eu-central-1",
    credentials,
  });

  const dynamoClient = new DynamoDBClient({
    region: "eu-central-1",
    credentials,
  });

  const docClient = DynamoDBDocumentClient.from(dynamoClient);

  return {
    s3Client,
    docClient,
    bucketName,
  };
}

// Export types for the services
export type AwsServices = Awaited<ReturnType<typeof initializeAwsServices>>;
