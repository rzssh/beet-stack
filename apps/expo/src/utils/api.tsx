import type { App } from "@acme/server/app";
import { treaty } from "@elysiajs/eden";
import { QueryClient } from "@tanstack/react-query";
import { authClient } from "./auth";
import { getApiUrl } from "./base-url";

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export const api = treaty<App>(getApiUrl(), {
  fetch: { credentials: "omit" },
  headers: () => {
    const cookies = authClient.getCookie();
    return cookies ? { Cookie: cookies } : undefined;
  },
});

const failed = (action: string, status: number) =>
  new Error(`${action} failed with HTTP ${status}`);

export const messageQueries = {
  all: () => ({
    queryKey: ["messages"] as const,
    queryFn: async () => {
      const response = await api.messages.get();
      if (response.error || !response.data || !("messages" in response.data)) {
        throw failed("Loading messages", response.status);
      }
      return response.data.messages;
    },
  }),
  byId: (id: string) => ({
    queryKey: ["messages", id] as const,
    queryFn: async () => {
      const response = await api.messages({ id }).get();
      if (response.error || !response.data || !("message" in response.data)) {
        throw failed("Loading message", response.status);
      }
      return response.data.message;
    },
  }),
};

export const messageMutations = {
  create: async (input: { title: string; content: string }) => {
    const response = await api.messages.post(input);
    if (response.error || !response.data || !("message" in response.data)) {
      throw failed("Creating message", response.status);
    }
    return response.data.message;
  },
  update: async (input: { id: string; title: string; content: string }) => {
    const response = await api
      .messages({ id: input.id })
      .patch({ title: input.title, content: input.content });
    if (response.error || !response.data || !("message" in response.data)) {
      throw failed("Updating message", response.status);
    }
    return response.data.message;
  },
  delete: async (id: string) => {
    const response = await api.messages({ id }).delete();
    if (response.error) throw failed("Deleting message", response.status);
  },
};
