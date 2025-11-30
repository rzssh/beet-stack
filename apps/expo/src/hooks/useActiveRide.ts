import { useQuery } from "@tanstack/react-query";

import { useAuth } from "~/lib/hooks";
import { rideQueries } from "~/utils/api";

export function useActiveRide() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    ...rideQueries.active(),
    enabled: isAuthenticated,
    refetchInterval: (query) => {
      // Only poll if there's actually an active ride
      return query.state.data ? 3000 : false;
    },
    retry: false, // Don't retry 400 errors
  });
}
