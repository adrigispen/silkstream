// src/services/__mocks__/awsServices.ts
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { Client } from "@opensearch-project/opensearch";
import type { AwsServices } from "../../config/aws";

const mockDocClientSend = jest.fn();
const mockS3Send = jest.fn();
const mockSearchSend = jest.fn();

export const mockAwsServices: AwsServices = {
  docClient: {
    send: mockDocClientSend as jest.Mock,
  } as unknown as DynamoDBDocumentClient,
  s3Client: {
    send: mockS3Send as jest.Mock,
  } as unknown as S3Client,
  bucketName: "test-bucket",
  searchClient: {
    send: mockSearchSend as jest.Mock,
  } as unknown as Client,
};

export { mockDocClientSend, mockS3Send };
