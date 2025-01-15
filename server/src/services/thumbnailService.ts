import ffmpeg, { FfprobeData } from "fluent-ffmpeg";
import { promises as fs } from "fs";
import { promisify } from "util";
import { S3Service } from "./s3Service";
import { retry } from "../utils/retry";
import path from "path";

interface ThumbnailServiceMetadata {
  createdDate?: Date;
  duration?: number;
  thumbnailKey?: string;
  error?: string;
}

export class ThumbnailService {
  constructor(private readonly s3Service: S3Service) {}

  async processVideo(videoKey: string): Promise<ThumbnailServiceMetadata> {
    const filename = path.basename(videoKey);
    const videoPath = `/tmp/${filename}`;
    const thumbnailPath = `/tmp/thumbnail-${filename}.jpg`;

    try {
      await fs.mkdir("/tmp", { recursive: true });
      await this.s3Service.downloadFile(videoKey, videoPath);

      // Verify file exists and is readable
      try {
        await fs.access(videoPath, fs.constants.R_OK);
        const stats = await fs.stat(videoPath);
        console.log("Video file details:", {
          path: videoPath,
          size: stats.size,
          exists: true,
          readable: true,
        });
      } catch (error) {
        console.error("File access error:", error);
        throw new Error(`Cannot access video file: ${error}`);
      }

      const metadata = await retry(() => this.getVideoMetadata(videoPath), 3);
      const thumbnailKey = await retry(async () => {
        await this.generateThumbnail(videoPath, thumbnailPath);
        const key = `thumbnails/${filename}.jpg`;
        await this.s3Service.uploadFile(thumbnailPath, key);
        return key;
      }, 3);

      return {
        createdDate: metadata.createdDate,
        duration: metadata.duration,
        thumbnailKey,
      };
    } finally {
      // Cleanup temp files
      await this.cleanupFiles([videoPath, thumbnailPath]);
    }
  }

  private async getVideoMetadata(
    videoPath: string
  ): Promise<{ createdDate?: Date; duration?: number }> {
    const ffprobePromise = promisify<string, FfprobeData>(ffmpeg.ffprobe);
    const data = await ffprobePromise(videoPath);

    let createdDate: Date | undefined;
    // Try different metadata tags where creation date might be stored
    const dateString =
      data.format.tags?.creation_time ||
      data.format.tags?.["com.apple.quicktime.creationdate"] ||
      data.format.tags?.["date"];

    if (dateString) {
      try {
        createdDate = new Date(dateString);
      } catch (error) {
        console.warn(`Failed to parse date: ${dateString}`, error);
      }
    }

    return {
      createdDate,
      duration: data.format.duration,
    };
  }
  catch(error: any) {
    console.error("Failed to read video metadata:", error);
    return {
      error: "Failed to read video metadata",
    };
  }

  private async generateThumbnail(
    videoPath: string,
    thumbnailPath: string
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.log("Generating thumbnail:", {
        input: videoPath,
        output: thumbnailPath,
      });

      ffmpeg(videoPath)
        .screenshots({
          count: 1,
          folder: "/tmp", // Specify the output folder explicitly
          filename: `thumbnail-${path.basename(videoPath)}.jpg`,
          size: "320x?",
        })
        .on("start", (commandLine) => {
          console.log("FFmpeg command:", commandLine);
        })
        .on("error", (err, stdout, stderr) => {
          console.error("FFmpeg error:", err);
          console.error("FFmpeg stderr:", stderr);
          console.error("FFmpeg stdout:", stdout);
          reject(err);
        })
        .on("end", () => {
          console.log("Thumbnail generated successfully");
          resolve();
        });
    });
  }

  private async cleanupFiles(paths: string[]) {
    for (const path of paths) {
      try {
        const exists = await fs
          .access(path)
          .then(() => true)
          .catch(() => false);

        if (exists) {
          await fs.unlink(path);
        }
      } catch (error) {
        console.warn(`Failed to cleanup file ${path}:`, error);
      }
    }
  }
}
