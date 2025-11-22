import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: isDev ? "debug" : "info",
  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname",
        translateTime: "HH:MM:ss",
      },
    },
  }),
});

// API request/response logging utilities
export const apiLogger = {
  request: (method: string, path: string, details?: any) => {
    logger.info({ method, path, ...details }, `🚀 ${method} ${path}`);
  },
  
  response: (method: string, path: string, status: number, details?: any) => {
    const emoji = status >= 400 ? "❌" : "✅";
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
    logger[level]({ method, path, status, ...details }, `${emoji} ${method} ${path} → ${status}`);
  },
  
  error: (method: string, path: string, error: Error, details?: any) => {
    logger.error({
      method,
      path,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...details,
    }, `🚨 ${method} ${path} - ${error.message}`);
  }
};

// Client-side logger (browser-safe)
export const clientLogger = {
  group: (title: string) => {
    if (typeof console !== "undefined") console.group(title);
  },
  
  groupEnd: () => {
    if (typeof console !== "undefined") console.groupEnd();
  },
  
  apiRequest: (method: string, path: string, details?: any) => {
    if (typeof console !== "undefined") {
      console.group(`🚀 API Request: ${method.toUpperCase()} ${path}`);
      if (details?.url) console.log("URL:", details.url);
      if (details?.body) console.log("Body:", details.body);
      if (details?.headers) console.log("Headers:", details.headers);
      console.groupEnd();
    }
  },
  
  apiResponse: (method: string, path: string, status: number, details?: any) => {
    if (typeof console !== "undefined") {
      const isError = status >= 400;
      console.group(`${isError ? "❌" : "✅"} API Response: ${method.toUpperCase()} ${path} (${status})`);
      console.log("Status:", status, details?.statusText || "");
      console.log("URL:", details?.url || "");
      if (isError && details) {
        console.error("Error Details:");
        console.error("- Status:", status);
        console.error("- Headers:", details.headers);
        if (details.body) console.error("- Response Body:", details.body);
      }
      console.groupEnd();
    }
  },
  
  apiError: (method: string, path: string, error: Error) => {
    if (typeof console !== "undefined") {
      console.group(`❌ API Error: ${method.toUpperCase()} ${path}`);
      console.error("Error:", error);
      console.error("Stack:", error.stack);
      console.error("Cause:", error.cause);
      console.groupEnd();
    }
  }
};