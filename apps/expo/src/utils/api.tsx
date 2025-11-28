import type { App } from "@acme/web/app";
import { treaty } from "@elysiajs/eden";
import { QueryClient } from "@tanstack/react-query";

import { authClient } from "./auth";
import { getBaseUrl } from "./base-url";

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
}).api;

// Helper functions for React Query integration
export const messageQueries = {
  all: () => ({
    queryKey: ["messages", "all"] as const,
    queryFn: async () => {
      const response = await api.messages.get();
      if (response.error) {
        throw new Error("Failed to fetch messages");
      }
      return response.data?.messages ?? [];
    },
  }),
  byId: (id: string) => ({
    queryKey: ["messages", "byId", id] as const,
    queryFn: async () => {
      const response = await api.messages({ id }).get();
      if (response.error) {
        throw new Error("Failed to fetch message");
      }
      return response.data?.message;
    },
  }),
};

export const messageMutations = {
  create: () => ({
    mutationFn: async (data: { title: string; content: string }) => {
      const response = await api.messages.post(data);
      if (response.error) {
        throw new Error("Failed to create message");
      }
      return response.data?.message;
    },
  }),
  delete: () => ({
    mutationFn: async (id: string) => {
      const response = await api.messages({ id }).delete();
      if (response.error) {
        throw new Error("Failed to delete message");
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
      if (response.error) throw new Error("Failed to fetch driver profile");
      return response.data?.profile;
    },
  }),
  nearby: (lat: number, lng: number, radius?: number) => ({
    queryKey: ["drivers", "nearby", lat, lng, radius] as const,
    queryFn: async () => {
      const response = await api.drivers.nearby.get({
        query: { lat, lng, radius },
      });
      if (response.error) throw new Error("Failed to fetch nearby drivers");
      return response.data?.drivers ?? [];
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
      if (response.error) throw new Error("Failed to create driver profile");
      return response.data?.profile;
    },
  }),
  goOnline: () => ({
    mutationFn: async () => {
      const response = await api.drivers["go-online"].post({});
      if (response.error) throw new Error("Failed to go online");
      return response.data?.profile;
    },
  }),
  goOffline: () => ({
    mutationFn: async () => {
      const response = await api.drivers["go-offline"].post({});
      if (response.error) throw new Error("Failed to go offline");
      return response.data?.profile;
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
      if (response.error) throw new Error("Failed to update location");
      return response.data?.location;
    },
  }),
};

export const rideQueries = {
  active: () => ({
    queryKey: ["rides", "active"] as const,
    queryFn: async () => {
      const response = await api.rides.active.get();
      console.log("Active ride response:", response);
      if (response.error) throw new Error("Failed to fetch active ride");
      return response.data?.ride;
    },
  }),
  history: (mode: "rider" | "driver" = "rider") => ({
    queryKey: ["rides", "history", mode] as const,
    queryFn: async () => {
      const response = await api.rides.history.get({ query: { mode } });
      if (response.error) throw new Error("Failed to fetch ride history");
      return response.data?.rides ?? [];
    },
  }),
  pending: (lat: number, lng: number) => ({
    queryKey: ["rides", "pending", lat, lng] as const,
    queryFn: async () => {
      const response = await api.rides.pending.get({
        query: { lat, lng },
      });
      if (response.error) throw new Error("Failed to fetch pending rides");
      return response.data?.rides ?? [];
    },
    enabled: lat !== 0 && lng !== 0,
  }),
  byId: (id: string) => ({
    queryKey: ["rides", id] as const,
    queryFn: async () => {
      const response = await api.rides({ id }).get();
      if (response.error) throw new Error("Failed to fetch ride");
      return response.data?.ride;
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
      if (response.error) throw new Error("Failed to request ride");
      return response.data?.ride;
    },
  }),
  accept: () => ({
    mutationFn: async (rideId: string) => {
      const response = await api.rides({ id: rideId }).accept.post({});
      if (response.error) throw new Error("Failed to accept ride");
      return response.data?.ride;
    },
  }),
  arrived: () => ({
    mutationFn: async (rideId: string) => {
      const response = await api.rides({ id: rideId }).arrived.post({});
      if (response.error) throw new Error("Failed to mark arrived");
      return response.data?.ride;
    },
  }),
  start: () => ({
    mutationFn: async (rideId: string) => {
      const response = await api.rides({ id: rideId }).start.post({});
      if (response.error) throw new Error("Failed to start ride");
      return response.data?.ride;
    },
  }),
  complete: () => ({
    mutationFn: async (rideId: string) => {
      const response = await api.rides({ id: rideId }).complete.post({});
      if (response.error) throw new Error("Failed to complete ride");
      return response.data?.ride;
    },
  }),
  cancel: () => ({
    mutationFn: async (data: { rideId: string; reason?: string }) => {
      const response = await api
        .rides({ id: data.rideId })
        .cancel.post({ reason: data.reason });
      if (response.error) throw new Error("Failed to cancel ride");
      return response.data?.ride;
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
      if (response.error) throw new Error("Failed to rate driver");
      return response.data?.ride;
    },
  }),
};
