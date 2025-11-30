import { authClient } from "~/utils/auth";

export function useAuth() {
  const { data: session, isPending } = authClient.useSession();

  return {
    session,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    user: session?.user ?? null,
  };
}
