import type { App } from "@acme/web/app";
import { treaty } from "@elysiajs/eden";
import { QueryClient } from "@tanstack/react-query";

import { authClient } from "~/lib/auth";
import { getBaseUrl } from "~/lib/base-url";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

export const api = treaty<App>(getBaseUrl(), {
  fetch: { credentials: "include" },
  headers: () => {
    const cookies = authClient.getCookie();
    if (cookies) {
      return { Cookie: cookies };
    }
  },
  onRequest: (path, opts) => console.log(`[API] ${opts.method} ${path}`),
  onResponse: (res) => console.log(`[API] ${res.status} ${res.url}`),
}).api;
