// src/controllers/videoController.ts
import { Request, Response } from "express";
import { S3Service } from "../services/s3Service";
import { DynamoService } from "../services/dynamoService";
import type { AwsServices } from "../config/aws";

export class VideoController {
  private s3Service: S3Service;
  private dynamoService: DynamoService;

  constructor(awsServices: AwsServices) {
    this.s3Service = new S3Service(awsServices);
    this.dynamoService = new DynamoService(awsServices);
  }

  getUploadUrl = async (req: Request, res: Response) => {
    try {
      const { fileName, fileType } = req.body;
      const key = `uploads/${Date.now()}-${fileName}`;

      const url = await this.s3Service.getSignedUploadUrl(key, fileType);

      res.json({ url, key });
    } catch (error) {
      console.error("Error generating signed URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  };

  listVideos = async (_req: Request, res: Response): Promise<any> => {
    try {
      const response = await this.s3Service.listS3Objects();

      if (!response.Contents) {
        return res.json({ videos: [] });
      }

      const videos = await Promise.all(
        response.Contents.map(async (object) => {
          const url = await this.s3Service.getSignedDownloadUrl(object.Key!);
          const metadataResult = await this.dynamoService.getMetadata(
            object.Key!
          );

          return {
            id: object.Key,
            key: object.Key,
            url,
            lastModified: object.LastModified,
            size: object.Size,
            metadata: metadataResult.Item || null,
          };
        })
      );

      res.json({ videos });
    } catch (error) {
      console.error("Error listing videos:", error);
      res.status(500).json({ error: "Failed to list videos" });
    }
  };
}
