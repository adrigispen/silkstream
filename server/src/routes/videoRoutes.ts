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

  return router;
}
