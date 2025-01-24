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

  getVideoById = async (req: Request, res: Response): Promise<any> => {
    try {
      const videoId = req.params.videoId;
      const dbResult = await this.dynamoService.getMetadata(videoId);

      const metadata = dbResult?.Item || {};
      const url = await this.s3Service.getSignedDownloadUrl(videoId);

      let thumbnailUrl;
      if (metadata.thumbnailKey) {
        thumbnailUrl = await this.s3Service.getSignedDownloadUrl(
          metadata.thumbnailKey
        );
      }

      const response = {
        id: metadata.id,
        key: metadata.id,
        url,
        metadata,
        thumbnailUrl,
      };
      return res.json(response);
    } catch (error) {
      console.error("Error getting video:", error);
      return res.status(500).json({ error: `Failed to get video` });
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
        const favorites = await this.dynamoService.getRandomFavorites(20);

        const favoritesWithUrls = await Promise.all(
          favorites.map(async (metadata) => {
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
          videos: favoritesWithUrls,
          totalCount: favorites.length,
          nextPageToken: "",
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

  listAllVideos = async (req: Request, res: Response): Promise<any> => {
    try {
      const {
        sortBy,
        sortDirection = "desc",
        pageToken,
        limit = 20,
        tags,
        category,
        search,
      } = req.query;

      const hasFilters = search || category || tags;

      if (!hasFilters) {
        const response = await this.dynamoService.getAllVideos();
        let sorted;
        if (sortBy && sortBy !== "createdDate") {
          sorted = [...response].sort((a, b) => {
            let aVal: string, bVal: string;
            switch (sortBy) {
              case "title":
                aVal = a.title || "";
                bVal = b.title || "";
                break;
              case "category":
                aVal = a.category || "";
                bVal = b.category || "";
                break;
              default:
                return 0;
            }
            return sortDirection === "desc"
              ? aVal.toLowerCase().localeCompare(bVal.toLowerCase())
              : bVal.toLowerCase().localeCompare(aVal.toLowerCase());
          });
        } else {
          sorted = [...response].sort((a, b) => {
            if (!a.createdDate) return -1;
            if (!b.createdDate) return 1;
            return sortDirection === "desc"
              ? new Date(b.createdDate || "").getTime() -
                  new Date(a.createdDate || "").getTime()
              : new Date(a.createdDate || "").getTime() -
                  new Date(b.createdDate || "").getTime();
          });
        }
        const pageSize = parseInt(limit as string) || 20;
        const startIndex = pageToken
          ? parseInt(pageToken as string) * pageSize
          : 0;
        const endIndex = startIndex + pageSize;
        const paginatedMetadata = sorted.slice(startIndex, endIndex);
        return res.json({
          metadata: paginatedMetadata,
          totalCount: response.length,
          nextPageToken:
            endIndex < response.length
              ? String(startIndex / pageSize + 1)
              : null,
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

        return res.json({
          metadata: dbResult.videos,
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

  toggleFavorite = async (req: Request, res: Response): Promise<any> => {
    try {
      const { videoId } = req.params;
      const isFavorited = await this.dynamoService.toggleFavorite(videoId);
      return res.json({ isFavorited });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      return res
        .status(500)
        .json({ error: "Failed to toggle favorite status" });
    }
  };

  getRandomFavorites = async (req: Request, res: Response): Promise<any> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const favorites = await this.dynamoService.getRandomFavorites(limit);
      return res.json({ videos: favorites });
    } catch (error) {
      console.error("Error getting random favorites:", error);
      return res.status(500).json({ error: "Failed to get random favorites" });
    }
  };

  checkFavorite = async (req: Request, res: Response): Promise<any> => {
    try {
      const videoId = req.params.videoId;
      const isFavorited = await this.dynamoService.isFavorited(videoId);
      return res.json({ isFavorited });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return res.status(500).json({ error: "Failed to check favorite status" });
    }
  };

  getUntaggedVideos = async (req: Request, res: Response): Promise<any> => {
    try {
      const response = await this.s3Service.listS3Objects();
      if (!response.Contents) {
        return res.json({ videos: [] });
      }

      const orphanedVideos = await this.dynamoService.filterOutTaggedVideos(
        response.Contents
      );

      // Get signed URLs for each orphaned video
      const videosWithUrls = await Promise.all(
        orphanedVideos.map(async (key) => ({
          key,
          id: key,
          url: await this.s3Service.getSignedDownloadUrl(key),
        }))
      );

      return res.json({ videos: videosWithUrls });
    } catch (error) {
      console.error("Error getting untagged videos:", error);
      return res.status(500).json({ error: "Failed to get untagged videos" });
    }
  };

  getRecentlyTaggedVideos = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const videoMetadata = await this.dynamoService.getRecentlyTaggedVideos();

      const videosWithThumbnailsAndUrls = await Promise.all(
        videoMetadata.map(async (data) => ({
          key: data.s3Key,
          id: data.id,
          metadata: data,
          thumbnailUrl: await this.s3Service.getSignedDownloadUrl(
            data.thumbnailKey ?? ""
          ),
          url: await this.s3Service.getSignedDownloadUrl(data.s3Key),
        }))
      );
      res.json({ videos: videosWithThumbnailsAndUrls });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recently tagged videos" });
    }
  };
}
