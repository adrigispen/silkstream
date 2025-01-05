// src/services/s3Service.ts
import {
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
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

    return getSignedUrl(this.services.s3Client, command, { expiresIn: 3600 });
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
}
