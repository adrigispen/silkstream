// src/controllers/metadataController.ts
import { Request, Response } from "express";
import { DynamoService } from "../services/dynamoService";
import type { AwsServices } from "../config/aws";

export class MetadataController {
  private dynamoService: DynamoService;

  constructor(awsServices: AwsServices) {
    this.dynamoService = new DynamoService(awsServices);
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

      await this.dynamoService.updateMetadata(videoId, updates);

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating metadata:", error);
      res.status(500).json({ error: "Failed to update metadata" });
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
}
