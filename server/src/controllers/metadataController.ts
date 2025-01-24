// src/controllers/metadataController.ts
import { Request, Response } from "express";
import { DynamoService } from "../services/dynamoService";
import type { AwsServices } from "../config/aws";
import { VideoMetadataUpsert } from "../types/video";
import { ThumbnailService } from "../services/thumbnailService";
import { S3Service } from "../services/s3Service";

export class MetadataController {
  private dynamoService: DynamoService;
  private thumbnailService: ThumbnailService;
  private s3Service: S3Service;

  constructor(awsServices: AwsServices) {
    this.dynamoService = new DynamoService(awsServices);
    this.s3Service = new S3Service(awsServices);
    this.thumbnailService = new ThumbnailService(this.s3Service);
  }

  saveMetadata = async (req: Request, res: Response) => {
    try {
      const { videoId } = req.params;
      const metadata = {
        id: videoId,
        ...req.body,
        uploadDate: new Date().toISOString(),
      };

      await this.dynamoService.saveMetadata(metadata);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving metadata:", error);
      res.status(500).json({ error: "Failed to save metadata" });
    }
  };

  getMetadata = async (req: Request, res: Response): Promise<any> => {
    try {
      const { videoId } = req.params;
      const result = await this.dynamoService.getMetadata(videoId);

      if (!result.Item) {
        return res.status(404).json({ error: "Video metadata not found" });
      }

      res.json(result.Item);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      res.status(500).json({ error: "Failed to fetch metadata" });
    }
  };

  updateMetadata = async (req: Request, res: Response) => {
    try {
      const { videoId } = req.params;
      const updates = req.body;

      const existingData = await this.dynamoService.getMetadata(videoId);
      const oldTags = existingData.Item?.tags || [];
      const newTags = updates.tags || [];
      await this.dynamoService.updateTagsForVideo(oldTags, newTags);

      if (!existingData.Item?.thumbnailKey) {
        const thumbnailData = await this.thumbnailService.processVideo(videoId);
        const fullUpdates = {
          ...updates,
          thumbnailKey: thumbnailData.thumbnailKey,
          createdDate: thumbnailData.createdDate?.toISOString(),
          duration: thumbnailData.duration,
          uploadDate: new Date().toISOString(),
        };

        await this.dynamoService.updateMetadata(videoId, fullUpdates);
      } else {
        await this.dynamoService.updateMetadata(videoId, updates);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating metadata:", error);
      res.status(500).json({ error: "Failed to update metadata" });
    }
  };

  getCategories = async (req: Request, res: Response): Promise<any> => {
    try {
      const unsorted = await this.dynamoService.getCategories();
      const categories = [...unsorted].sort((a, b) => a.localeCompare(b));
      res.json({ categories });
    } catch (error) {
      console.error("Error getting categories:", error);
      res.status(500).json({ error: "Failed to get categories" });
    }
  };

  getTags = async (req: Request, res: Response): Promise<any> => {
    try {
      const unsorted = await this.dynamoService.getTags();
      const tags = [...unsorted].sort((a, b) => a.localeCompare(b));
      res.json({ tags });
    } catch (error) {
      console.error("Error getting tags:", error);
      res.status(500).json({ error: "Failed to get tags" });
    }
  };

  getTagSuggestions = async (req: Request, res: Response): Promise<any> => {
    try {
      const { prefix = "" } = req.query;
      if (typeof prefix !== "string") {
        return res.status(400).json({ error: "Invalid prefix parameter" });
      }

      const suggestions = await this.dynamoService.getSuggestions(prefix);
      res.json({ suggestions });
    } catch (error) {
      console.error("Error getting tag suggestions:", error);
      res.status(500).json({ error: "Failed to get tag suggestions" });
    }
  };

  batchUpsertMetadata = async (req: Request, res: Response): Promise<any> => {
    try {
      const updates = req.body;

      await Promise.all(
        updates.map(async (update: VideoMetadataUpsert) => {
          if (update.isNew) {
            await this.dynamoService.saveMetadata({
              id: update.videoId,
              ...update.metadata,
            });
          } else {
            const existingData = await this.dynamoService.getMetadata(
              update.videoId
            );

            let fullUpdates = update.metadata;

            if (!existingData.Item?.thumbnailKey) {
              const thumbnailData = await this.thumbnailService.processVideo(
                update.videoId
              );
              fullUpdates = {
                ...update.metadata,
                thumbnailKey: thumbnailData.thumbnailKey,
                createdDate: thumbnailData.createdDate?.toISOString(),
                duration: thumbnailData.duration,
              };
            }

            await this.dynamoService.updateMetadata(
              update.videoId,
              fullUpdates
            );
          }
        })
      );

      return res.json({ success: true });
    } catch (error) {
      console.error("Error in batch upsert:", error);
      return res.status(500).json({ error: "Failed to update videos" });
    }
  };
}
