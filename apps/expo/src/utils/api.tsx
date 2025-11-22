import { QueryClient } from "@tanstack/react-query";
import { createApiClient } from "@acme/api";

import { authClient } from "./auth";
import { getBaseUrl } from "./base-url";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

/**
 * Type-safe API client using Eden Treaty.
 * Automatically includes auth cookies for authenticated requests.
 */
export const api = createApiClient({
  baseUrl: getBaseUrl(),
  headers: async () => {
    const headers: Record<string, string> = {};
    
    // Include auth cookies if available
    const cookies = authClient.getCookie();
    if (cookies) {
      headers.Cookie = cookies;
    }
    
    return headers;
  },
});

export type { App, Session, User } from "@acme/api";
