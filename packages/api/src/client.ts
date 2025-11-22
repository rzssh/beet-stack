import { treaty } from "@elysiajs/eden";
import type { App } from "./types";

export interface CreateApiClientOptions {
  baseUrl: string;
  headers?: Record<string, string> | ((path: string, options: RequestInit) => Record<string, string>);
  credentials?: "include" | "omit" | "same-origin";
}

/**
 * Creates a type-safe API client using Eden Treaty
 * Following the official Elysia integration patterns
 */
export function createApiClient(options: CreateApiClientOptions) {
  return treaty<App>(options.baseUrl, {
    fetch: {
      credentials: options.credentials ?? "include",
      mode: "cors",
    },
    headers: options.headers,
  });
}