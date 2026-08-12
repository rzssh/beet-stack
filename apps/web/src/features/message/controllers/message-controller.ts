import { type Message, unwrap } from "@beet/core/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api";

const messageKeys = {
  all: ["messages"] as const,
};

export const messageController = {
  useMessagesQuery(initialData?: Message[]) {
    return useQuery({
      queryKey: messageKeys.all,
      queryFn: loadMessages,
      initialData,
    });
  },

  useCreateMessageMutation() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (input: { title: string; content: string }) =>
        unwrap<{ message: Message }>(
          await api().messages.post(input),
          "Creating message",
        ).message,
      onSuccess: (message) =>
        queryClient.setQueryData<Message[]>(messageKeys.all, (messages) => [
          message,
          ...(messages ?? []),
        ]),
    });
  },

  useUpdateMessageMutation() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (input: {
        id: string;
        title: string;
        content: string;
      }) =>
        unwrap<{ message: Message }>(
          await api()
            .messages({ id: input.id })
            .patch({ title: input.title, content: input.content }),
          "Updating message",
        ).message,
      onSuccess: (message) =>
        queryClient.setQueryData<Message[]>(messageKeys.all, (messages) =>
          (messages ?? []).map((current) =>
            current.id === message.id ? message : current,
          ),
        ),
    });
  },

  useDeleteMessageMutation() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (id: string) => {
        await unwrap(await api().messages({ id }).delete(), "Deleting message");
      },
      onSuccess: (_void, id) =>
        queryClient.setQueryData<Message[]>(messageKeys.all, (messages) =>
          (messages ?? []).filter((current) => current.id !== id),
        ),
    });
  },
};

export async function loadMessages(): Promise<Message[]> {
  return unwrap<{ messages: Message[] }>(
    await api().messages.get(),
    "Loading messages",
  ).messages;
}
