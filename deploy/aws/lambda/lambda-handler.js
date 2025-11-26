// AWS Lambda handler for Elysia application
import { app } from "../../apps/server/src/app.js";

// Convert Elysia app to Lambda handler
export const handler = async (event, context) => {
  try {
    // Convert API Gateway event to standard HTTP request
    const url = new URL(
      event.path,
      `https://${event.headers.Host || event.headers.host || "localhost"}`
    );
    
    // Add query parameters
    if (event.queryStringParameters) {
      Object.entries(event.queryStringParameters).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    // Create request object
    const request = new Request(url.toString(), {
      method: event.httpMethod,
      headers: event.headers,
      body: event.body || undefined,
    });

    // Process request through Elysia app
    const response = await app.handle(request);

    // Convert Elysia response to Lambda response format
    const body = await response.text();
    const headers = {};
    
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      statusCode: response.status,
      headers,
      body,
      isBase64Encoded: false,
    };
  } catch (error) {
    console.error("Lambda handler error:", error);
    
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      isBase64Encoded: false,
    };
  }
};