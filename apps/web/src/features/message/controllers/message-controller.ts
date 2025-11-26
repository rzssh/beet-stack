import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api";

const messageKeys = {
  all: ["messages"] as const,
  detail: (id: string) => ["messages", id] as const,
};

export const messageController = {
  useMessagesQuery() {
    return useQuery({
      queryKey: messageKeys.all,
      queryFn: async () => {
        const response = await api().messages.get();
        return response.data ?? { messages: [] };
      },
    });
  },

  useMessageQuery({ id }: { id: string }) {
    return useQuery({
      queryKey: messageKeys.detail(id),
      queryFn: async () => {
        const response = await api().messages({ id }).get();
        return response.data ?? { message: null };
      },
      enabled: !!id,
    });
  },

  useCreateMessageMutation() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async ({
        params,
      }: {
        params: { title: string; content: string };
      }) => {
        const response = await api().messages.post(params);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: messageKeys.all });
      },
    });
  },

  useDeleteMessageMutation() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async ({ id }: { id: string }) => {
        await api().messages({ id }).delete();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: messageKeys.all });
      },
    });
  },
};
