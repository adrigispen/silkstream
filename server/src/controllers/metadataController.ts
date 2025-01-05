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
      await this.dynamoService.updateMetadata(videoId, req.body);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating metadata:", error);
      res.status(500).json({ error: "Failed to update metadata" });
    }
  };
}
