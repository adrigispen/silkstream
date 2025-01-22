import { Router } from "express";
import { VideoController } from "../controllers/videoController";
import type { AwsServices } from "../config/aws";
import { MetadataController } from "../controllers/metadataController";

export function createVideoRouter(awsServices: AwsServices) {
  const router = Router();
  const videoController = new VideoController(awsServices);
  const metadataController = new MetadataController(awsServices);

  router.post("/get-upload-url", videoController.getUploadUrl);
  router.get("/videos", videoController.listVideos);
  router.get("/videos-archive", videoController.listAllVideos);
  router.get("/videos/:videoId", videoController.getVideoById);

  router.post("/videos/:videoId/metadata", metadataController.saveMetadata);
  router.get("/videos/:videoId/metadata", metadataController.getMetadata);
  router.patch("/videos/:videoId/metadata", (req, res) => {
    // Decode the videoId parameter
    req.params.videoId = decodeURIComponent(req.params.videoId);
    return metadataController.updateMetadata(req, res);
  });
  router.get("/tags/suggest", metadataController.getTagSuggestions);
  router.get("/tags", metadataController.getTags);
  router.get("/categories", metadataController.getCategories);

  router.post("/videos/batch-upsert", metadataController.batchUpsertMetadata);
  router.delete("/videos/:videoId", videoController.deleteVideo);
  router.post("/videos/batch-delete", videoController.batchDeleteVideos);

  router.post("/videos/:videoId/favorite", videoController.toggleFavorite);
  router.get("/videos/random-favorites", videoController.getRandomFavorites);
  router.get("/videos/:videoId/is-favorite", videoController.checkFavorite);

  return router;
}
