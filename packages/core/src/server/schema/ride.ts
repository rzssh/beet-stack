import { t } from "elysia";

export const rideStatusEnum = t.Union([
  t.Literal("requested"),
  t.Literal("accepted"),
  t.Literal("driver_arrived"),
  t.Literal("in_progress"),
  t.Literal("completed"),
  t.Literal("cancelled"),
]);

export const requestRideInput = t.Object({
  pickupLat: t.Number({ minimum: -90, maximum: 90 }),
  pickupLng: t.Number({ minimum: -180, maximum: 180 }),
  pickupAddress: t.String({ minLength: 1 }),
  dropoffLat: t.Number({ minimum: -90, maximum: 90 }),
  dropoffLng: t.Number({ minimum: -180, maximum: 180 }),
  dropoffAddress: t.String({ minLength: 1 }),
});

export const rideIdParams = t.Object({
  id: t.String(),
});

export const cancelRideInput = t.Object({
  reason: t.Optional(t.String()),
});

export const rateRideInput = t.Object({
  rating: t.Number({ minimum: 1, maximum: 5 }),
  feedback: t.Optional(t.String()),
});

export const rideHistoryQuery = t.Object({
  mode: t.Optional(t.Union([t.Literal("rider"), t.Literal("driver")])),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
});

export const pendingRequestsQuery = t.Object({
  lat: t.Numeric({ minimum: -90, maximum: 90 }),
  lng: t.Numeric({ minimum: -180, maximum: 180 }),
  radius: t.Optional(t.Numeric({ minimum: 1, maximum: 50 })),
});

export const rideModel = t.Object({
  id: t.String(),
  riderId: t.String(),
  driverId: t.Nullable(t.String()),
  status: rideStatusEnum,
  pickupLat: t.Number(),
  pickupLng: t.Number(),
  pickupAddress: t.String(),
  dropoffLat: t.Number(),
  dropoffLng: t.Number(),
  dropoffAddress: t.String(),
  estimatedPrice: t.Nullable(t.Number()),
  finalPrice: t.Nullable(t.Number()),
  estimatedDistanceKm: t.Nullable(t.Number()),
  estimatedDurationMin: t.Nullable(t.Number()),
  requestedAt: t.Date(),
  acceptedAt: t.Nullable(t.Date()),
  arrivedAt: t.Nullable(t.Date()),
  startedAt: t.Nullable(t.Date()),
  completedAt: t.Nullable(t.Date()),
  cancelledAt: t.Nullable(t.Date()),
  cancelReason: t.Nullable(t.String()),
  riderRating: t.Nullable(t.Number()),
  driverRating: t.Nullable(t.Number()),
});
