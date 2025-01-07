
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { initializeAwsServices } from "./config/aws";
import { LambdaHandler } from "./utils/lambdaAdapter";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const awsServices = await initializeAwsServices();
    const lambdaHandler = new LambdaHandler(awsServices);
    return await lambdaHandler.handleRequest(event);
  } catch (error) {
    console.error("Lambda error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
