// Export the client creation functions
export { createApiClient } from "./client";
export type { CreateApiClientOptions } from "./client";

// Export pre-configured web client
export { api } from "./web-client";

// Export server types for client usage
export type { App } from "./types";

// Export auth types for convenience
export type { Session, User } from "@acme/auth/types";