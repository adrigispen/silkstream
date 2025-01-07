import serverlessExpress from "@vendia/serverless-express";
import { createApp } from "./app";
import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
} from "aws-lambda";

let serverlessApp: any;

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  if (!serverlessApp) {
    const app = await createApp();
    serverlessApp = serverlessExpress({
      app,
      respondWithErrors: true, // This helps with debugging
      logSettings: {
        level: "debug", // Increased logging to help debug issues
      },
    });
  }

  // Add console.log to debug the event
  console.log("Event:", JSON.stringify(event, null, 2));

  return serverlessApp(event, context);
};
