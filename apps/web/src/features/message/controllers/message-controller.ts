import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api";

const messageKeys = {
  all: ["messages"] as const,
};

const failed = (action: string, status: number) =>
  new Error(`${action} failed with HTTP ${status}`);

export const messageController = {
  useMessagesQuery(initialData?: Awaited<ReturnType<typeof loadMessages>>) {
    return useQuery({
      queryKey: messageKeys.all,
      queryFn: loadMessages,
      initialData,
    });
  },

  useCreateMessageMutation() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (input: { title: string; content: string }) => {
        const response = await api().messages.post(input);
        if (response.error || !response.data || !("message" in response.data)) {
          throw failed("Creating message", response.status);
        }
        return response.data.message;
      },
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: messageKeys.all }),
    });
  },

  useUpdateMessageMutation() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (input: {
        id: string;
        title: string;
        content: string;
      }) => {
        const response = await api()
          .messages({ id: input.id })
          .patch({ title: input.title, content: input.content });
        if (response.error || !response.data || !("message" in response.data)) {
          throw failed("Updating message", response.status);
        }
        return response.data.message;
      },
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: messageKeys.all }),
    });
  },

  useDeleteMessageMutation() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (id: string) => {
        const response = await api().messages({ id }).delete();
        if (response.error) throw failed("Deleting message", response.status);
      },
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: messageKeys.all }),
    });
  },
};

export async function loadMessages() {
  const response = await api().messages.get();
  if (response.error || !response.data || !("messages" in response.data)) {
    throw failed("Loading messages", response.status);
  }
  return response.data.messages;
}
