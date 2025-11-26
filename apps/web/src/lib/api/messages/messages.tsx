import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api";

const messageKeys = {
  all: ["messages"] as const,
  detail: (id: string) => ["messages", id] as const,
};

export const useMessagesQuery = () => {
  return useQuery({
    queryKey: messageKeys.all,
    queryFn: async () => {
      const response = await api().messages.get();
      return response.data?.messages ?? [];
    },
  });
};

export const useMessageQuery = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: messageKeys.detail(id),
    queryFn: async () => {
      const { data } = await api().messages({ id }).get();
      return data?.message ?? null;
    },
    enabled: !!id,
  });
};

export const useCreateMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { title: string; content: string }) => {
      return await api().messages.post(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.all });
    },
  });
};

export const useDeleteMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await api().messages({ id }).delete();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.all });
    },
  });
};
