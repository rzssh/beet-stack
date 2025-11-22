import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { countQueryOptions, incrementCountMutationOptions } from "../_lib/count-queries";
import { tanStackCountRepository } from "../_lib/count-tanstack-serverFn-repo";

class CountTanStackController {
  // Query hook
  useCount = () => {
    return useQuery(countQueryOptions);
  };

  // Mutation hook
  useIncrementCount = () => {
    const queryClient = useQueryClient();
    const { mutate, isPending, error } = useMutation({
      ...incrementCountMutationOptions,
      onMutate: async () => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: countQueryOptions.queryKey });
        
        // Snapshot the previous value
        const previousCount = queryClient.getQueryData(countQueryOptions.queryKey);
        
        // Optimistically update to the new value
        queryClient.setQueryData(countQueryOptions.queryKey, (old: any) => ({
          count: { count: (old?.count?.count ?? 0) + 1 }
        }));
        
        // Return a context object with the snapshotted value
        return { previousCount };
      },
      onError: (err, newCount, context) => {
        // If the mutation fails, use the context returned from onMutate to roll back
        queryClient.setQueryData(countQueryOptions.queryKey, context?.previousCount);
      },
      onSettled: () => {
        // Always refetch after error or success to ensure server state
        void queryClient.invalidateQueries({ queryKey: countQueryOptions.queryKey });
      },
    });

    return { incrementCount: mutate, isPending, error };
  };

  // Route loader method
  getCount = async () => {
    return tanStackCountRepository.getCount({ signal: undefined });
  };
}

export const countTanStackController = new CountTanStackController();