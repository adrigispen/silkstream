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

  listVideos = async (req: Request, res: Response): Promise<any> => {
    try {
      const {
        search,
        sortBy,
        sortDirection = "desc",
        tags,
        category,
        pageToken,
        limit = 10,
      } = req.query;

      const hasFilters = search || tags || category;

      if (!hasFilters) {
        // If no filters, get directly from S3
        const response = await this.s3Service.listS3Objects();

        if (!response.Contents) {
          return res.json({ videos: [], totalCount: 0, nextPageToken: null });
        }

        const videos = await Promise.all(
          response.Contents.map(async (object) => {
            const url = await this.s3Service.getSignedDownloadUrl(object.Key!);
            const metadataResult = await this.dynamoService.getMetadata(
              object.Key!
            );

            let thumbnailUrl;
            if (metadataResult.Item?.thumbnailKey) {
              thumbnailUrl = await this.s3Service.getSignedDownloadUrl(
                metadataResult.Item.thumbnailKey
              );
            }

            return {
              id: object.Key,
              key: object.Key,
              url,
              thumbnailUrl,
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
            if (!a.metadata?.createdDate) return -1;
            if (!b.metadata?.createdDate) return 1;
            return sortDirection === "desc"
              ? new Date(b.metadata.createdDate || "").getTime() -
                  new Date(a.metadata.createdDate || "").getTime()
              : new Date(a.metadata.createdDate || "").getTime() -
                  new Date(b.metadata.createdDate || "").getTime();
          });
        }

        const pageSize = parseInt(limit as string) || 10;
        const startIndex = pageToken
          ? parseInt(pageToken as string) * pageSize
          : 0;
        const endIndex = startIndex + pageSize;
        const paginatedVideos = sorted.slice(startIndex, endIndex);

        return res.json({
          videos: paginatedVideos,
          totalCount: videos.length,
          nextPageToken:
            endIndex < videos.length ? String(startIndex + 1) : null,
        });
      } else {
        const dbResult = await this.dynamoService.queryVideos({
          search: search as string,
          sortBy: sortBy as any,
          sortDirection: sortDirection as "asc" | "desc",
          tags: tags ? (tags as string).split(",") : undefined,
          category: category as string,
          pageToken: pageToken as string,
          limit: limit ? parseInt(limit as string) : undefined,
        });

        const videosWithUrls = await Promise.all(
          dbResult.videos.map(async (metadata) => {
            const url = await this.s3Service.getSignedDownloadUrl(metadata.id);
            let thumbnailUrl;

            if (metadata.thumbnailKey) {
              thumbnailUrl = await this.s3Service.getSignedDownloadUrl(
                metadata.thumbnailKey
              );
            }

            return {
              id: metadata.id,
              key: metadata.id,
              url,
              metadata,
              thumbnailUrl,
            };
          })
        );

        return res.json({
          videos: videosWithUrls,
          totalCount: dbResult.count,
          nextPageToken: dbResult.nextPageToken,
        });
      }
    } catch (error) {
      console.error("Error listing videos:", error);
      res.status(500).json({ error: "Failed to list videos" });
    }
  };

  deleteVideo = async (req: Request, res: Response): Promise<any> => {
    try {
      const { videoId } = req.params;

      // Delete from S3
      await this.s3Service.deleteObject(videoId);
      // Delete from DynamoDB
      await this.dynamoService.deleteVideo(videoId);
      // Delete from search index
      // await this.searchService.deleteVideo(videoId);

      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting video:", error);
      return res.status(500).json({ error: "Failed to delete video" });
    }
  };

  batchDeleteVideos = async (req: Request, res: Response): Promise<any> => {
    try {
      const { videoIds } = req.body;

      await Promise.all(
        videoIds.map(async (videoId: string) => {
          await this.s3Service.deleteObject(videoId);
          await this.dynamoService.deleteVideo(videoId);
          // await this.searchService.deleteVideo(videoId);
        })
      );

      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting videos:", error);
      return res.status(500).json({ error: "Failed to delete videos" });
    }
  };
}
