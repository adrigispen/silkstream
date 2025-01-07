import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Request, Response } from "express";
import { VideoController } from "../controllers/videoController";
import { MetadataController } from "../controllers/metadataController";
import { AwsServices } from "../config/aws";

export class LambdaHandler {
  private videoController: VideoController;
  private metadataController: MetadataController;

  constructor(awsServices: AwsServices) {
    this.videoController = new VideoController(awsServices);
    this.metadataController = new MetadataController(awsServices);
  }

  async handleRequest(
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> {
    const path = event.path;
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : undefined;
    const params = event.pathParameters || {};
    const query = event.queryStringParameters || {};

    try {
      let result;

      // Route mapping
      switch (true) {
        case path === "/videos" && method === "GET":
          result = await this.videoController.listVideos(
            {} as Request,
            {} as Response
          );
          break;

        case path === "/get-upload-url" && method === "POST":
          result = await this.videoController.getUploadUrl(
            { body } as Request,
            {} as Response
          );
          break;

        case path.match(/^\/videos\/.*\/metadata$/) && method === "PATCH":
          result = await this.metadataController.updateMetadata(
            { body, params } as Request,
            {} as Response
          );
          break;

        case path === "/tags/suggest" && method === "GET":
          result = await this.metadataController.getTagSuggestions(
            { query } as Request,
            {} as Response
          );
          break;

        default:
          return {
            statusCode: 404,
            body: JSON.stringify({ error: "Route not found" }),
          };
      }

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify(result),
      };
    } catch (error) {
      console.error("Request error:", error);
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Internal server error" }),
      };
    }
  }
}
