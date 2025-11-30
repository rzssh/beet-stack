type LogCategory =
  | "api"
  | "state"
  | "error"
  | "websocket"
  | "places"
  | "ride";

const ENABLE_LOGGING = __DEV__;

function formatLog(category: LogCategory, message: string, data?: any) {
  if (!ENABLE_LOGGING) return;

  const timestamp = new Date().toISOString().split("T")[1].slice(0, 12);
  const prefix = `[${timestamp}] [${category}]`;

  if (data) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

export const logger = {
  api: (message: string, data?: any) => formatLog("api", message, data),
  state: (message: string, data?: any) => formatLog("state", message, data),
  error: (message: string, data?: any) => {
    formatLog("error", message, data);
    if (data?.error instanceof Error) {
      console.error(data.error.stack);
    }
  },
  ws: (message: string, data?: any) => formatLog("websocket", message, data),
  places: (message: string, data?: any) => formatLog("places", message, data),
  ride: (message: string, data?: any) => formatLog("ride", message, data),
};
