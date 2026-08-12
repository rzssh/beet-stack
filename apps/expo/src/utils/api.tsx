import { type Message, unwrap } from "@acme/core/contracts";
import type { App } from "@acme/core/server";
import { treaty } from "@elysiajs/eden";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
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

export const messageKeys = {
  all: () => ["messages"] as const,
  detail: (id: string) => ["messages", id] as const,
};

export const messageQueries = {
  all: () => ({
    queryKey: messageKeys.all(),
    queryFn: async (): Promise<Message[]> =>
      unwrap<{ messages: Message[] }>(
        await api.messages.get(),
        "Loading messages",
      ).messages,
  }),
  byId: (id: string) => ({
    queryKey: messageKeys.detail(id),
    queryFn: async (): Promise<Message> =>
      unwrap<{ message: Message }>(
        await api.messages({ id }).get(),
        "Loading message",
      ).message,
  }),
};

export const messageMutations = {
  create: async (input: { title: string; content: string }): Promise<Message> =>
    unwrap<{ message: Message }>(
      await api.messages.post(input),
      "Creating message",
    ).message,
  update: async (input: {
    id: string;
    title: string;
    content: string;
  }): Promise<Message> =>
    unwrap<{ message: Message }>(
      await api
        .messages({ id: input.id })
        .patch({ title: input.title, content: input.content }),
      "Updating message",
    ).message,
  delete: async (id: string): Promise<void> => {
    await unwrap(await api.messages({ id }).delete(), "Deleting message");
  },
};

export function useMessageCache() {
  const queryClient = useQueryClient();
  return {
    add(message: Message) {
      queryClient.setQueryData<Message[]>(messageKeys.all(), (messages) => [
        message,
        ...(messages ?? []),
      ]);
    },
    put(message: Message) {
      queryClient.setQueryData(messageKeys.detail(message.id), message);
      queryClient.setQueryData<Message[]>(messageKeys.all(), (messages) =>
        (messages ?? []).map((current) =>
          current.id === message.id ? message : current,
        ),
      );
    },
    remove(id: string) {
      queryClient.setQueryData<Message[]>(messageKeys.all(), (messages) =>
        (messages ?? []).filter((current) => current.id !== id),
      );
      queryClient.removeQueries({ queryKey: messageKeys.detail(id) });
    },
  };
}
