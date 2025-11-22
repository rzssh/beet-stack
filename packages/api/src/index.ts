// Export the client creation functions
export { createApiClient } from "./client";
export type { CreateApiClientOptions } from "./client";

// Export pre-configured web client
export { api } from "./web-client";

// Export server app type when available (for type inference)
export type { App } from "./types";