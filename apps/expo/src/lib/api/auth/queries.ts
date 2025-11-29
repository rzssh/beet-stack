import { queryOptions } from "@tanstack/react-query";

import { authClient } from "~/utils/auth";

export const authQueries = {
  session: () =>
    queryOptions({
      queryKey: ["auth", "session"] as const,
      queryFn: async () => {
        const session = await authClient.getSession();
        return session;
      },
      staleTime: 10 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }),
};
