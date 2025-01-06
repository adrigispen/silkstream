import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import type { AwsServices } from "../config/aws";
import { VideoMetadata } from "../types/video";
import { TagRecord } from "../types/tag";

export class DynamoService {
  constructor(private readonly services: AwsServices) {}

  async saveMetadata(metadata: VideoMetadata) {
    return this.services.docClient.send(
      new PutCommand({
        TableName: "silkstream-vids",
        Item: metadata,
      })
    );
  }

  async getMetadata(id: string) {
    return this.services.docClient.send(
      new GetCommand({
        TableName: "silkstream-vids",
        Key: { id },
      })
    );
  }

  async updateMetadata(id: string, updates: Partial<VideoMetadata>) {
    const expressionData = this.generateUpdateExpression(updates);

    return this.services.docClient.send(
      new UpdateCommand({
        TableName: "silkstream-vids",
        Key: { id },
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

  // Tag-related methods
  async updateTagCount(tag: string, increment: boolean) {
    try {
      await this.services.docClient.send(
        new UpdateCommand({
          TableName: "silkstream-tags",
          Key: { tag },
          UpdateExpression:
            "SET #count = if_not_exists(#count, :zero) :change, lastUsed = :now",
          ExpressionAttributeNames: {
            "#count": "count",
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

  async getSuggestions(prefix: string): Promise<TagRecord[]> {
    try {
      // Scan for tags that begin with the prefix
      const result = await this.services.docClient.send(
        new QueryCommand({
          TableName: "silkstream-tags",
          KeyConditionExpression: "begins_with(tag, :prefix)",
          ExpressionAttributeValues: {
            ":prefix": prefix.toLowerCase(),
          },
          Limit: 10, // Limit suggestions to 10
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
}
