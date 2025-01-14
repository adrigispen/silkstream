import { VideoMetadata } from "../types/video";
import { AwsServices } from "../config/aws";
import { DynamoService } from "./dynamoService";

export class SearchService {
  private index = "videos";

  constructor(private readonly services: AwsServices) {}

  async search(query: string, category?: string, tags?: string[]) {
    const must: any[] = [];

    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ["title^2", "description", "category", "tags"],
          fuzziness: "AUTO",
        },
      });
    }

    if (category) {
      must.push({ match: { category } });
    }

    if (tags?.length) {
      must.push({
        terms: { tags },
      });
    }

    const response = await this.services.searchClient.search({
      index: this.index,
      body: {
        query: {
          bool: { must },
        },
      },
    });

    return response.body.hits.hits.map((hit: any) => ({
      ...hit._source,
      score: hit._score,
    }));
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    for (let i = 0; i < 3; i++) {
      try {
        return await operation();
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        lastError = error as Error;
        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }
    throw lastError!;
  }

  async indexAllExistingVideos() {
    try {
      // Get all videos from DynamoDB
      const dynamoService = new DynamoService(this.services);
      const allVideos = await dynamoService.getAllVideos();

      // Batch index videos
      const operations = allVideos.flatMap((video) => [
        { index: { _index: this.index, _id: video.id } },
        {
          title: video.title,
          description: video.description,
          category: video.category,
          tags: video.tags,
          s3Key: video.id,
        },
      ]);

      // Process in chunks to avoid overwhelming the service
      const chunkSize = 500;
      for (let i = 0; i < operations.length; i += chunkSize) {
        const chunk = operations.slice(i, i + chunkSize);
        await this.withRetry(() =>
          this.services.searchClient.bulk({ body: chunk })
        );
        console.log(`Indexed videos ${i} to ${i + chunk.length}`);
      }

      console.log("All videos indexed successfully");
    } catch (error) {
      console.error("Failed to index existing videos:", error);
      throw error;
    }
  }

  async indexVideo(videoId: string, metadata: VideoMetadata) {
    await this.services.searchClient.index({
      index: this.index,
      id: videoId,
      body: {
        title: metadata.title,
        description: metadata.description,
        category: metadata.category,
        tags: metadata.tags,
        s3Key: metadata.id,
      },
    });
  }
}
