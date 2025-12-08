import { api } from "~/lib/api";

export const rideQueries = {
  active: () => ({
    queryKey: ["rides", "active"] as const,
    queryFn: async () => {
      const response = await api.rides.active.get();
      return response.data;
    },
  }),
  history: (
    query: NonNullable<
      NonNullable<Parameters<typeof api.rides.history.get>[0]>["query"]
    >,
  ) => ({
    queryKey: ["rides", "history", query.mode] as const,
    queryFn: async () => {
      const response = await api.rides.history.get({ query });
      return response.data ?? [];
    },
  }),
  pending: (
    query: NonNullable<
      NonNullable<Parameters<typeof api.rides.pending.get>[0]>["query"]
    >,
  ) => ({
    queryKey: ["rides", "pending", query.lat, query.lng] as const,
    queryFn: async () => {
      const response = await api.rides.pending.get({ query });
      return response.data ?? [];
    },
    enabled: query.lat !== 0 && query.lng !== 0,
  }),
  byId: (id: string) => ({
    queryKey: ["rides", id] as const,
    queryFn: async () => {
      const response = await api.rides({ id }).get();
      return response.data;
    },
  }),
};

export const rideMutations = {
  request: () => ({
    mutationFn: async (data: Parameters<typeof api.rides.request.post>[0]) => {
      const response = await api.rides.request.post(data);
      return response.data;
    },
  }),
  accept: () => ({
    mutationFn: async (rideId: string) => {
      const response = await api.rides({ id: rideId }).accept.post();
      return response.data;
    },
  }),
  arrived: () => ({
    mutationFn: async (rideId: string) => {
      const response = await api.rides({ id: rideId }).arrived.post();
      return response.data;
    },
  }),
  start: () => ({
    mutationFn: async (rideId: string) => {
      const response = await api.rides({ id: rideId }).start.post();
      return response.data;
    },
  }),
  complete: () => ({
    mutationFn: async (rideId: string) => {
      const response = await api.rides({ id: rideId }).complete.post();
      return response.data;
    },
  }),
  cancel: () => ({
    mutationFn: async (
      rideId: string,
      data: NonNullable<
        Parameters<ReturnType<typeof api.rides>["cancel"]["post"]>[0]
      >,
    ) => {
      const response = await api
        .rides({ id: rideId })
        .cancel.post({ reason: data.reason });
      return response.data;
    },
  }),
  rateDriver: () => ({
    mutationFn: async (
      rideId: string,
      data: Parameters<
        ReturnType<typeof api.rides>["rate"]["driver"]["post"]
      >[0],
    ) => {
      const response = await api.rides({ id: rideId }).rate.driver.post({
        rating: data.rating,
        feedback: data.feedback,
      });
      return response.data;
    },
  }),
};
