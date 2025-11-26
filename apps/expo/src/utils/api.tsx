import type { App } from "@acme/web/app";
import { treaty } from "@elysiajs/eden";
import { QueryClient } from "@tanstack/react-query";

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

export const api = treaty<App>(getBaseUrl(), {
  fetch: { credentials: "include" },
  headers: () => {
    const cookies = authClient.getCookie();
    if (cookies) {
      return { Cookie: cookies };
    }
  },
}).api;

// Helper functions for React Query integration
export const messageQueries = {
  all: () => ({
    queryKey: ["messages", "all"] as const,
    queryFn: async () => {
      const response = await api.messages.get();
      if (response.error) {
        throw new Error("Failed to fetch messages");
      }
      return response.data?.messages ?? [];
    },
  }),
  byId: (id: string) => ({
    queryKey: ["messages", "byId", id] as const,
    queryFn: async () => {
      const response = await api.messages({ id }).get();
      if (response.error) {
        throw new Error("Failed to fetch message");
      }
      return response.data?.message;
    },
  }),
};

export const messageMutations = {
  create: () => ({
    mutationFn: async (data: { title: string; content: string }) => {
      const response = await api.messages.post(data);
      console.log(response.status);
      console.log(response.data);
      console.log(response.error);
      console.log(response.headers);
      if (response.error) {
        throw new Error("Failed to create message");
      }
      return response.data?.message;
    },
  }),
  delete: () => ({
    mutationFn: async (id: string) => {
      const response = await api.messages({ id }).delete();
      if (response.error) {
        throw new Error("Failed to delete message");
      }
      return response.data;
    },
  }),
};
