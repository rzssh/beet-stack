import type { App } from "@acme/web/app";
import { treaty } from "@elysiajs/eden";
import { QueryClient } from "@tanstack/react-query";

import { authClient } from "./auth";
import { getBaseUrl } from "./base-url";

function extractErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null) {
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
    if ("value" in error && typeof error.value === "string") {
      return error.value;
    }
    if (
      "value" in error &&
      typeof error.value === "object" &&
      error.value !== null &&
      "message" in error.value &&
      typeof error.value.message === "string"
    ) {
      return error.value.message;
    }
  }
  return fallback;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

export const api = treaty<App>(getBaseUrl(), {
  fetch: { credentials: "include" },
  headers: () => {
    const cookies = authClient.getCookie();
    if (cookies) {
      return { Cookie: cookies };
    }
  },
  onRequest: (path, opts) => console.log(`[API] ${opts.method} ${path}`),
  onResponse: (res) => console.log(`[API] ${res.status} ${res.url}`),
}).api;

// Helper functions for React Query integration
export const messageQueries = {
  all: () => ({
    queryKey: ["messages", "all"] as const,
    queryFn: async () => {
      const response = await api.messages.get();
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to fetch messages"),
        );
      }
      return response.data ?? [];
    },
  }),
  byId: (id: string) => ({
    queryKey: ["messages", "byId", id] as const,
    queryFn: async () => {
      const response = await api.messages({ id }).get();
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to fetch message"),
        );
      }
      return response.data;
    },
  }),
};

export const messageMutations = {
  create: () => ({
    mutationFn: async (data: { title: string; content: string }) => {
      const response = await api.messages.post(data);
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to create message"),
        );
      }
      return response.data;
    },
  }),
  delete: () => ({
    mutationFn: async (id: string) => {
      const response = await api.messages({ id }).delete();
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to delete message"),
        );
      }
      return response.data;
    },
  }),
};

export const driverQueries = {
  profile: () => ({
    queryKey: ["driver", "profile"] as const,
    queryFn: async () => {
      const response = await api.drivers.profile.get();
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to fetch driver profile"),
        );
      }
      return response.data;
    },
  }),
  nearby: (lat: number, lng: number, radius?: number) => ({
    queryKey: ["drivers", "nearby", lat, lng, radius] as const,
    queryFn: async () => {
      const response = await api.drivers.nearby.get({
        query: { lat, lng, radius },
      });
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to fetch nearby drivers"),
        );
      }
      return response.data ?? [];
    },
    enabled: lat !== 0 && lng !== 0,
  }),
};

export const driverMutations = {
  createProfile: () => ({
    mutationFn: async (data: {
      vehicleMake: string;
      vehicleModel: string;
      vehicleYear: string;
      vehicleColor: string;
      licensePlate: string;
    }) => {
      const response = await api.drivers.profile.post(data);
      if (response.error) {
        throw new Error(
          extractErrorMessage(
            response.error,
            "Failed to create driver profile",
          ),
        );
      }
      return response.data;
    },
  }),
  goOnline: () => ({
    mutationFn: async () => {
      const response = await api.drivers["go-online"].post({});
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to go online"),
        );
      }
      return response.data;
    },
  }),
  goOffline: () => ({
    mutationFn: async () => {
      const response = await api.drivers["go-offline"].post({});
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to go offline"),
        );
      }
      return response.data;
    },
  }),
  updateLocation: () => ({
    mutationFn: async (data: {
      lat: number;
      lng: number;
      heading?: number;
      speed?: number;
    }) => {
      const response = await api.drivers.location.post(data);
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to update location"),
        );
      }
      return response.data;
    },
  }),
};

export const rideQueries = {
  active: () => ({
    queryKey: ["rides", "active"] as const,
    queryFn: async () => {
      const response = await api.rides.active.get();
      if (response.error) {
        // Return null instead of throwing on 400 (no active ride)
        if (response.status === 400) {
          return null;
        }
        throw new Error(
          extractErrorMessage(response.error, "Failed to fetch active ride"),
        );
      }
      return response.data;
    },
  }),
  history: (mode: "rider" | "driver" = "rider") => ({
    queryKey: ["rides", "history", mode] as const,
    queryFn: async () => {
      const response = await api.rides.history.get({ query: { mode } });
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to fetch ride history"),
        );
      }
      return response.data ?? [];
    },
  }),
  pending: (lat: number, lng: number) => ({
    queryKey: ["rides", "pending", lat, lng] as const,
    queryFn: async () => {
      const response = await api.rides.pending.get({
        query: { lat, lng },
      });
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to fetch pending rides"),
        );
      }
      return response.data ?? [];
    },
    enabled: lat !== 0 && lng !== 0,
  }),
  byId: (id: string) => ({
    queryKey: ["rides", id] as const,
    queryFn: async () => {
      const response = await api.rides({ id }).get();
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to fetch ride"),
        );
      }
      return response.data;
    },
  }),
};

export const rideMutations = {
  request: () => ({
    mutationFn: async (data: {
      pickupLat: number;
      pickupLng: number;
      pickupAddress: string;
      dropoffLat: number;
      dropoffLng: number;
      dropoffAddress: string;
    }) => {
      const response = await api.rides.request.post(data);
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to request ride"),
        );
      }
      return response.data;
    },
  }),
  accept: () => ({
    mutationFn: async (rideId: string) => {
      const response = await api.rides({ id: rideId }).accept.post({});
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to accept ride"),
        );
      }
      return response.data;
    },
  }),
  arrived: () => ({
    mutationFn: async (rideId: string) => {
      const response = await api.rides({ id: rideId }).arrived.post({});
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to mark arrived"),
        );
      }
      return response.data;
    },
  }),
  start: () => ({
    mutationFn: async (rideId: string) => {
      const response = await api.rides({ id: rideId }).start.post({});
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to start ride"),
        );
      }
      return response.data;
    },
  }),
  complete: () => ({
    mutationFn: async (rideId: string) => {
      const response = await api.rides({ id: rideId }).complete.post({});
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to complete ride"),
        );
      }
      return response.data;
    },
  }),
  cancel: () => ({
    mutationFn: async (data: { rideId: string; reason?: string }) => {
      const response = await api
        .rides({ id: data.rideId })
        .cancel.post({ reason: data.reason });
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to cancel ride"),
        );
      }
      return response.data;
    },
  }),
  rateDriver: () => ({
    mutationFn: async (data: {
      rideId: string;
      rating: number;
      feedback?: string;
    }) => {
      const response = await api.rides({ id: data.rideId }).rate.driver.post({
        rating: data.rating,
        feedback: data.feedback,
      });
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to rate driver"),
        );
      }
      return response.data;
    },
  }),
};

export const flagQueries = {
  all: () => ({
    queryKey: ["flags"] as const,
    queryFn: async () => {
      const response = await api.flags.get();
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to fetch flags"),
        );
      }
      return response.data ?? [];
    },
  }),
  me: () => ({
    queryKey: ["flags", "me"] as const,
    queryFn: async () => {
      const response = await api.flags.me.get();
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to fetch user flags"),
        );
      }
      return response.data ?? [];
    },
  }),
};

export const flagMutations = {
  setFlag: () => ({
    mutationFn: async (data: { flagId: string; isEnabled: boolean }) => {
      const response = await api.flags.me({ flagId: data.flagId }).post({
        isEnabled: data.isEnabled,
      });
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to set flag"),
        );
      }
      return response.data;
    },
  }),
};

export const placesQueries = {
  autocomplete: (input: string, sessionToken: string, locationBias?: any) => ({
    queryKey: ["places", "autocomplete", input, locationBias] as const,
    queryFn: async () => {
      const response = await api.places.autocomplete.post({
        input,
        sessionToken,
        locationBias,
      });
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to fetch autocomplete"),
        );
      }
      return response.data ?? [];
    },
  }),
  details: (placeId: string) => ({
    queryKey: ["places", "details", placeId] as const,
    queryFn: async () => {
      const response = await api.places[{ id: placeId }].details.get();
      if (response.error) {
        throw new Error(
          extractErrorMessage(response.error, "Failed to fetch place details"),
        );
      }
      return response.data;
    },
  }),
};
