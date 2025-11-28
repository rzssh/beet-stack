import { t } from "elysia";

export const driverProfileModel = t.Object({
  id: t.String(),
  userId: t.String(),
  vehicleMake: t.String(),
  vehicleModel: t.String(),
  vehicleYear: t.String(),
  vehicleColor: t.String(),
  licensePlate: t.String(),
  licenseImageUrl: t.Nullable(t.String()),
  insuranceImageUrl: t.Nullable(t.String()),
  vehicleImageUrl: t.Nullable(t.String()),
  isVerified: t.Boolean(),
  isOnline: t.Boolean(),
  rating: t.Nullable(t.Number()),
  totalRides: t.Nullable(t.Number()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const createDriverProfileInput = t.Object({
  vehicleMake: t.String({ minLength: 1 }),
  vehicleModel: t.String({ minLength: 1 }),
  vehicleYear: t.String({ minLength: 4, maxLength: 4 }),
  vehicleColor: t.String({ minLength: 1 }),
  licensePlate: t.String({ minLength: 1 }),
});

export const updateDriverProfileInput = t.Partial(
  t.Object({
    vehicleMake: t.String({ minLength: 1 }),
    vehicleModel: t.String({ minLength: 1 }),
    vehicleYear: t.String({ minLength: 4, maxLength: 4 }),
    vehicleColor: t.String({ minLength: 1 }),
    licensePlate: t.String({ minLength: 1 }),
    licenseImageUrl: t.String(),
    insuranceImageUrl: t.String(),
    vehicleImageUrl: t.String(),
  }),
);

export const updateLocationInput = t.Object({
  lat: t.Number({ minimum: -90, maximum: 90 }),
  lng: t.Number({ minimum: -180, maximum: 180 }),
  heading: t.Optional(t.Number({ minimum: 0, maximum: 360 })),
  speed: t.Optional(t.Number({ minimum: 0 })),
});

export const nearbyDriversQuery = t.Object({
  lat: t.Numeric({ minimum: -90, maximum: 90 }),
  lng: t.Numeric({ minimum: -180, maximum: 180 }),
  radius: t.Optional(t.Numeric({ minimum: 1, maximum: 50 })),
});

export const driverLocationModel = t.Object({
  driverId: t.String(),
  lat: t.Number(),
  lng: t.Number(),
  heading: t.Nullable(t.Number()),
  speed: t.Nullable(t.Number()),
  updatedAt: t.Date(),
});
