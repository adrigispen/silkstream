// src/services/s3Service.ts
import {
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { promises as fs } from "fs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { AwsServices } from "../config/aws";

export class S3Service {
  constructor(private readonly services: AwsServices) {}

  async getSignedUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.services.bucketName,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.services.s3Client, command, {
      expiresIn: 3600,
    });
  }

  async listS3Objects() {
    const command = new ListObjectsV2Command({
      Bucket: this.services.bucketName,
      Prefix: "uploads/",
    });

    return this.services.s3Client.send(command);
  }

  async getSignedDownloadUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.services.bucketName,
      Key: key,
    });

    return getSignedUrl(this.services.s3Client, command, { expiresIn: 3600 });
  }

  async deleteObject(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.services.bucketName,
      Key: key,
    });

    return this.services.s3Client.send(command);
  }

  async downloadFile(key: string, localPath: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.services.bucketName,
        Key: key,
      });
      const response = await this.services.s3Client.send(command);

      if (!response.Body) {
        throw new Error("No body in response");
      }

      // Convert readable stream to buffer
      const chunks = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      // Write to temp file
      await fs.writeFile(localPath, buffer);
    } catch (error) {
      console.error(`Failed to download file ${key}:`, error);
      throw error;
    }
  }

  async uploadFile(localPath: string, key: string) {
    try {
      const fileContent = await fs.readFile(localPath);
      const command = new PutObjectCommand({
        Bucket: this.services.bucketName,
        Key: key,
        Body: fileContent,
      });
      await this.services.s3Client.send(command);
    } catch (error) {
      console.error(`Failed to upload file ${key}:`, error);
      throw error;
    }
  }
}
