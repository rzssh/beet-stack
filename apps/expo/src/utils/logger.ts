type LogCategory =
  | "api"
  | "state"
  | "error"
  | "websocket"
  | "places"
  | "ride";

const ENABLE_LOGGING = __DEV__;

function formatLog(category: LogCategory, message: string, data?: unknown) {
  if (!ENABLE_LOGGING) return;

  const timestamp =
    new Date().toISOString().split("T")[1]?.slice(0, 12) ?? "00:00:00.000";
  const prefix = `[${timestamp}] [${category}]`;

  if (data !== undefined) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

function hasErrorProperty(
  data: unknown
): data is { error: Error } {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    (data as { error: unknown }).error instanceof Error
  );
}

export const logger = {
  api: (message: string, data?: unknown) => formatLog("api", message, data),
  state: (message: string, data?: unknown) => formatLog("state", message, data),
  error: (message: string, data?: unknown) => {
    formatLog("error", message, data);
    if (hasErrorProperty(data)) {
      console.error(data.error.stack);
    }
  },
  ws: (message: string, data?: unknown) => formatLog("websocket", message, data),
  places: (message: string, data?: unknown) => formatLog("places", message, data),
  ride: (message: string, data?: unknown) => formatLog("ride", message, data),
};
