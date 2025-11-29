import { useQuery } from "@tanstack/react-query";

import { authQueries } from "~/lib/api/auth";

export function useAuth() {
  const { data: session, isLoading } = useQuery(authQueries.session());

  return {
    session,
    isLoading,
    isAuthenticated: !!session?.user,
    user: session?.user ?? null,
  };
}
