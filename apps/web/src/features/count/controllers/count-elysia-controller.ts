import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api";

const countKeys = {
  all: ["count"] as const,
  elysia: ["count", "elysia"] as const,
};

export const countElysiaController = {
  useCount() {
    return useQuery({
      queryKey: countKeys.elysia,
      queryFn: async () => {
        const response = await api().count.get();
        if (response.error) {
          throw new Error(String(response.error.value));
        }
        return response.data;
      },
    });
  },

  useIncrementCount() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async () => {
        const response = await api().count.post();
        if (response.error) {
          throw new Error(String(response.error.value));
        }
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: countKeys.elysia });
        queryClient.invalidateQueries({ queryKey: countKeys.all });
      },
    });
  },
};
