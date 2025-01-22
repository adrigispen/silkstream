import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import type { AwsServices } from "../config/aws";
import { VideoMetadata, VideoQueryParams } from "../types/video";
import { TagRecord } from "../types/tag";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export class DynamoService {
  constructor(private readonly services: AwsServices) {}

  private async calculateStartKey(
    page: number,
    limit: number
  ): Promise<Record<string, any> | undefined> {
    if (page <= 1) return undefined;

    const lastKeyCommand = new QueryCommand({
      TableName: "silkstream-vids",
      Limit: (page - 1) * limit,
      ScanIndexForward: false, // This maintains consistent ordering
    });

    const result = await this.services.docClient.send(lastKeyCommand);
    return result.LastEvaluatedKey;
  }

  async saveMetadata(metadata: VideoMetadata) {
    const searchableText = [
      metadata.title,
      metadata.description,
      metadata.category,
      ...(metadata.tags || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const result = await this.services.docClient.send(
      new PutCommand({
        TableName: "silkstream-vids",
        Item: {
          ...metadata,
          searchableText,
        },
      })
    );

    return result;
  }

  async getMetadata(id: string) {
    return this.services.docClient.send(
      new GetCommand({
        TableName: "silkstream-vids",
        Key: { id },
      })
    );
  }

  async updateMetadata(videoId: string, updates: Partial<VideoMetadata>) {
    const existingMetadata = await this.getMetadata(videoId);
    const category =
      !updates.category &&
      existingMetadata.Item &&
      existingMetadata.Item.category
        ? existingMetadata.Item.category
        : updates.category;

    const updatedMetadata = {
      ...existingMetadata.Item,
      ...updates,
      category,
    };

    const { id, ...finalUpdates } = updatedMetadata;

    const searchableText = [
      updatedMetadata.title,
      updatedMetadata.description,
      updatedMetadata.category,
      ...(updatedMetadata.tags || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    // Add searchableText to the updates
    const updatesWithSearch = {
      ...finalUpdates,
      searchableText,
    };

    const expressionData = this.generateUpdateExpression(updatesWithSearch);

    return this.services.docClient.send(
      new UpdateCommand({
        TableName: "silkstream-vids",
        Key: { id: videoId },
        ...expressionData,
      })
    );
  }

  private generateUpdateExpression(updates: Record<string, any>) {
    type ExpressionAttributeNames = { [key: string]: string };
    type ExpressionAttributeValues = { [key: string]: any };

    const exprAttrNames: ExpressionAttributeNames = {};
    const exprAttrValues: ExpressionAttributeValues = {};

    const updateExpr = Object.keys(updates).reduce((acc, key) => {
      exprAttrNames[`#${key}`] = key;
      exprAttrValues[`:${key}`] = updates[key];
      return acc.length === 0
        ? `set #${key} = :${key}`
        : `${acc}, #${key} = :${key}`;
    }, "");

    return {
      UpdateExpression: updateExpr,
      ExpressionAttributeNames: exprAttrNames,
      ExpressionAttributeValues: exprAttrValues,
    };
  }

  async getAllVideos() {
    try {
      const result = await this.services.docClient.send(
        new ScanCommand({
          TableName: "silkstream-vids",
        })
      );
      return result.Items || [];
    } catch (error) {
      console.error("Error retrieving all videos:", error);
      throw error;
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const result = await this.services.docClient.send(
        new ScanCommand({
          TableName: "silkstream-vids",
          ProjectionExpression: "category",
        })
      );

      const uniqueCategories = new Set<string>(
        (result.Items as { category: string }[]).map((record) =>
          record.category.toLowerCase()
        )
      );

      return [...uniqueCategories];
    } catch (error) {
      console.error("Error getting categories:", error);
      throw error;
    }
  }

  // Tag-related methods
  async updateTagCount(tag: string, increment: boolean) {
    try {
      await this.services.docClient.send(
        new UpdateCommand({
          TableName: "silkstream-tags",
          Key: { tag },
          UpdateExpression:
            "SET #count = if_not_exists(#count, :zero) + :change, #lastUsed = :now",
          ExpressionAttributeNames: {
            "#count": "count",
            "#lastUsed": "lastUsed",
          },
          ExpressionAttributeValues: {
            ":change": increment ? 1 : -1,
            ":zero": 0,
            ":now": new Date().toISOString(),
          },
        })
      );
    } catch (error) {
      console.error(`Error updating tag count for ${tag}:`, error);
      throw error;
    }
  }

  async getTags(): Promise<string[]> {
    try {
      const result = await this.services.docClient.send(
        new ScanCommand({
          TableName: "silkstream-tags",
        })
      );

      return (result.Items as TagRecord[]).map((record) => record.tag);
    } catch (error) {
      console.error("Error getting tags:", error);
      throw error;
    }
  }

  async getSuggestions(prefix: string): Promise<TagRecord[]> {
    try {
      const result = await this.services.docClient.send(
        new ScanCommand({
          TableName: "silkstream-tags",
          FilterExpression: "contains(tag, :prefix)",
          ExpressionAttributeValues: {
            ":prefix": prefix.toLowerCase(),
          },
          Limit: 1000,
        })
      );

      return result.Items as TagRecord[];
    } catch (error) {
      console.error("Error getting tag suggestions:", error);
      throw error;
    }
  }

  async updateTagsForVideo(oldTags: string[] = [], newTags: string[]) {
    // Decrease count for removed tags
    const removedTags = oldTags.filter((tag) => !newTags.includes(tag));
    await Promise.all(
      removedTags.map((tag) => this.updateTagCount(tag, false))
    );

    // Increase count for new tags
    const addedTags = newTags.filter((tag) => !oldTags.includes(tag));
    await Promise.all(addedTags.map((tag) => this.updateTagCount(tag, true)));
  }

  async queryVideos(params: VideoQueryParams) {
    const {
      search,
      sortBy = "uploadDate",
      sortDirection = "desc",
      tags,
      category,
      pageToken,
      limit = 10,
    } = params;

    let filterExpressions: string[] = [];
    const expressionValues: Record<string, any> = {};

    if (search) {
      filterExpressions.push("contains(searchableText, :search)");
      expressionValues[":search"] = search.toLowerCase();
    }
    if (category) {
      filterExpressions.push("category = :category");
      expressionValues[":category"] = category;
    }

    if (tags && tags.length > 0) {
      const tagFilters = tags.map((_, index) => `contains(tags, :tag${index})`);
      filterExpressions.push(`${tagFilters.join(" AND ")}`);
      tags.forEach((tag, index) => {
        expressionValues[`:tag${index}`] = tag;
      });
    }

    let exclusiveStartKey;
    let decodedOffset = 0;
    if (pageToken) {
      try {
        const decoded = JSON.parse(Buffer.from(pageToken, "base64").toString());
        exclusiveStartKey = decoded.LastEvaluatedKey;
        decodedOffset = decoded.offset || 0;
      } catch (error) {
        console.error("Invalid page token:", error);
      }
    }

    const filteredResults: any[] = [];
    let lastEvaluatedKey = exclusiveStartKey;
    let scannedAll = false;

    while (filteredResults.length < decodedOffset + limit && !scannedAll) {
      const command = new ScanCommand({
        TableName: "silkstream-vids",
        FilterExpression:
          filterExpressions.length > 0
            ? filterExpressions.join(" AND ")
            : undefined,
        ExpressionAttributeValues:
          Object.keys(expressionValues).length > 0
            ? expressionValues
            : undefined,
        Limit: 1000,
        ExclusiveStartKey: lastEvaluatedKey,
      });
      const result = await this.services.docClient.send(command);

      if (result.Items) {
        filteredResults.push(...result.Items);
      }

      lastEvaluatedKey = result.LastEvaluatedKey;
      scannedAll = !lastEvaluatedKey;
    }

    let sorted = filteredResults || [];
    if (sortBy && sortBy !== "uploadDate") {
      sorted = (filteredResults || []).sort((a, b) => {
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
          case "createdDate":
            aVal = new Date(a.createdDate || "").getTime().toString();
            bVal = new Date(b.createdDate || "").getTime().toString();
          default:
            return 0;
        }

        return sortDirection === "desc"
          ? aVal.toLowerCase().localeCompare(bVal.toLowerCase())
          : bVal.toLowerCase().localeCompare(aVal.toLowerCase());
      });
    }

    const paginatedResults = filteredResults.slice(
      decodedOffset,
      decodedOffset + limit
    );

    const nextPageToken =
      decodedOffset + limit < filteredResults.length
        ? Buffer.from(
            JSON.stringify({ lastEvaluatedKey, offset: decodedOffset + limit })
          ).toString("base64")
        : null;

    return {
      videos: paginatedResults,
      nextPageToken,
      count: filteredResults.length,
    };
  }

  async deleteVideo(videoId: string) {
    return this.services.docClient.send(
      new DeleteCommand({
        TableName: "silkstream-vids",
        Key: { id: videoId },
      })
    );
  }
}
