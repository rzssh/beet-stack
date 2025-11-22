import { createApiClient } from "@acme/api";

const getApiUrl = () => {
  // Use environment variable or default to localhost
  return import.meta.env.VITE_API_URL ?? "http://localhost:3001";
};

/**
 * Type-safe API client for the web app.
 * Automatically includes cookies for authentication.
 */
export const api = createApiClient({
  baseUrl: getApiUrl(),
  credentials: "include", // Include cookies automatically
});

export type { App, Session, User } from "@acme/api";