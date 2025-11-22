import type { Elysia } from "elysia";
import { apiLogger } from "./index.js";

/**
 * Extract all registered routes from an Elysia app
 */
export function getRegisteredRoutes(app: any): string[] {
  const routes: string[] = [];
  
  try {
    // Access Elysia's internal router to get all registered routes
    if (app.router && app.router.history) {
      for (const route of app.router.history) {
        if (route.path) {
          routes.push(route.path);
        }
      }
    }
    
    // Fallback: try to access routes through the app's internal structure
    if (routes.length === 0 && app.routes) {
      Object.keys(app.routes).forEach(path => {
        routes.push(path);
      });
    }
  } catch (error) {
    // Silent fallback - we don't want route extraction to break the app
  }
  
  return [...new Set(routes)].sort();
}

/**
 * Enhanced 404 handler that shows available routes
 */
export function create404Handler(app: any) {
  return ({ request }: { request: Request }) => {
    const path = new URL(request.url).pathname;
    const availableRoutes = getRegisteredRoutes(app);
    
    apiLogger.error(request.method, path, new Error("Route not found"), {
      availableRoutes: availableRoutes.length > 0 ? availableRoutes : ["Failed to extract routes"],
    });
    
    return new Response(
      JSON.stringify({
        error: "Route not found",
        path,
        method: request.method,
        ...(process.env.NODE_ENV === "development" && {
          availableRoutes: availableRoutes.length > 0 ? availableRoutes : ["Routes extraction failed"],
        }),
      }),
      { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      }
    );
  };
}

/**
 * Development middleware for request/response logging
 */
export function createDevLoggingMiddleware() {
  return {
    onRequest: ({ request }: { request: Request }) => {
      if (process.env.NODE_ENV === "development") {
        const path = new URL(request.url).pathname;
        apiLogger.request(request.method, path, {
          headers: Object.fromEntries(request.headers.entries()),
        });
      }
    },
    
    onAfterHandle: ({ request, response }: { request: Request; response?: Response }) => {
      if (process.env.NODE_ENV === "development") {
        const path = new URL(request.url).pathname;
        const status = response?.status ?? 200;
        apiLogger.response(request.method, path, status);
      }
    },
    
    onError: ({ error, request }: { error: Error; request: Request }) => {
      const path = new URL(request.url).pathname;
      apiLogger.error(request.method, path, error);
      
      return {
        success: false,
        error: error.message,
        ...(process.env.NODE_ENV === "development" && { 
          stack: error.stack,
          path 
        }),
      };
    }
  };
}