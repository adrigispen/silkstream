import { PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { AwsServices } from "../config/aws";
import { VideoMetadata } from "../types/video";

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
}
