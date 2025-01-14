// src/controllers/videoController.ts
import { Request, Response } from "express";
import { S3Service } from "../services/s3Service";
import { DynamoService } from "../services/dynamoService";
import type { AwsServices } from "../config/aws";
import { SearchService } from "../services/searchService";

export class VideoController {
  private s3Service: S3Service;
  private dynamoService: DynamoService;
  private searchService: SearchService;

  constructor(awsServices: AwsServices) {
    this.s3Service = new S3Service(awsServices);
    this.dynamoService = new DynamoService(awsServices);
    this.searchService = new SearchService(awsServices);
  }

  reindexAllVideos = async (req: Request, res: Response): Promise<any> => {
    try {
      await this.searchService.indexAllExistingVideos();
      return res.json({ success: true });
    } catch (error) {
      console.error("error reindexing videos: ", error);
      return res.status(500).json({ error: "failed to reindex videos" });
    }
  };

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

  listVideos = async (req: Request, res: Response): Promise<any> => {
    try {
      const {
        search,
        sortBy,
        sortDirection = "desc",
        tags,
        category,
        page,
        limit,
      } = req.query;

      const hasFilters = search || tags || category;

      if (!hasFilters) {
        // If no filters, get directly from S3
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

        let sorted;

        if (sortBy && sortBy !== "uploadDate") {
          sorted = [...videos].sort((a, b) => {
            let aVal: string, bVal: string;

            switch (sortBy) {
              case "title":
                aVal = a.metadata?.title || "";
                bVal = b.metadata?.title || "";
                break;
              case "category":
                aVal = a.metadata?.category || "";
                bVal = b.metadata?.category || "";
                break;
              default:
                return 0;
            }

            return sortDirection === "desc"
              ? aVal.toLowerCase().localeCompare(bVal.toLowerCase())
              : bVal.toLowerCase().localeCompare(aVal.toLowerCase());
          });
        } else {
          sorted = [...videos].sort((a, b) => {
            if (!a.metadata) return -1;
            if (!b.metadata) return 1;
            return sortDirection === "desc"
              ? new Date(b.lastModified || "").getTime() -
                  new Date(a.lastModified || "").getTime()
              : new Date(a.lastModified || "").getTime() -
                  new Date(b.lastModified || "").getTime();
          });
        }

        return res.json({
          videos: sorted,
          count: videos.length,
        });
      } else {
        const dbResult = await this.dynamoService.queryVideos({
          search: search as string,
          sortBy: sortBy as any,
          sortDirection: sortDirection as "asc" | "desc",
          tags: tags ? (tags as string).split(",") : undefined,
          category: category as string,
          page: page ? parseInt(page as string) : undefined,
          limit: limit ? parseInt(limit as string) : undefined,
        });

        const searchResults = await this.searchService.search(
          search as string,
          category as string,
          tags ? (tags as string).split(",") : undefined
        );

        const videosWithUrls = await Promise.all(
          dbResult.videos.map(async (metadata) => {
            const url = await this.s3Service.getSignedDownloadUrl(metadata.id);

            return {
              id: metadata.id,
              key: metadata.id,
              url,
              metadata,
            };
          })
        );

        const videosFromOpenSearch = await Promise.all(
          searchResults.map(async (result) => {
            const url = await this.s3Service.getSignedDownloadUrl(result.s3Key);
            return {
              id: result.s3Key,
              key: result.s3Key,
              url,
              metadata: result,
            };
          })
        );

        return res.json({
          videos: videosWithUrls,
          lastEvaluatedKey: dbResult.lastEvaluatedKey,
          count: dbResult.count,
        });
      }
    } catch (error) {
      console.error("Error listing videos:", error);
      res.status(500).json({ error: "Failed to list videos" });
    }
  };
}
