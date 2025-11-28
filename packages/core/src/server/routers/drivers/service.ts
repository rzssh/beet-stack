import { db, eq } from "@acme/db";
import * as schema from "@acme/db/schema";

interface CreateDriverProfileInput {
  userId: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  licensePlate: string;
}

interface UpdateDriverProfileInput {
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleColor?: string;
  licensePlate?: string;
  licenseImageUrl?: string;
  insuranceImageUrl?: string;
  vehicleImageUrl?: string;
}

interface UpdateLocationInput {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
}

export class DriversService {
  async getProfile(userId: string) {
    return db.query.driverProfile.findFirst({
      where: eq(schema.driverProfile.userId, userId),
    });
  }

  async createProfile(input: CreateDriverProfileInput) {
    const existing = await this.getProfile(input.userId);
    if (existing) return { error: "conflict" as const, profile: existing };

    const [profile] = await db
      .insert(schema.driverProfile)
      .values({
        userId: input.userId,
        vehicleMake: input.vehicleMake,
        vehicleModel: input.vehicleModel,
        vehicleYear: input.vehicleYear,
        vehicleColor: input.vehicleColor,
        licensePlate: input.licensePlate,
      })
      .returning();

    if (!profile) return { error: "create_failed" as const };
    return { profile };
  }

  async updateProfile(userId: string, input: UpdateDriverProfileInput) {
    const [profile] = await db
      .update(schema.driverProfile)
      .set(input)
      .where(eq(schema.driverProfile.userId, userId))
      .returning();

    return profile;
  }

  async goOnline(userId: string) {
    const [profile] = await db
      .update(schema.driverProfile)
      .set({ isOnline: true })
      .where(eq(schema.driverProfile.userId, userId))
      .returning();

    return profile;
  }

  async goOffline(userId: string) {
    const [profile] = await db
      .update(schema.driverProfile)
      .set({ isOnline: false })
      .where(eq(schema.driverProfile.userId, userId))
      .returning();

    if (profile) {
      await db
        .delete(schema.driverLocation)
        .where(eq(schema.driverLocation.driverId, userId));
    }

    return profile;
  }

  async updateLocation(userId: string, input: UpdateLocationInput) {
    const profile = await this.getProfile(userId);
    if (!profile) return { error: "not_found" as const };
    if (!profile.isOnline) return { error: "not_online" as const };

    const existing = await db.query.driverLocation.findFirst({
      where: eq(schema.driverLocation.driverId, userId),
    });

    if (existing) {
      const [location] = await db
        .update(schema.driverLocation)
        .set({
          lat: input.lat,
          lng: input.lng,
          heading: input.heading,
          speed: input.speed,
        })
        .where(eq(schema.driverLocation.driverId, userId))
        .returning();
      return { location };
    }

    const [location] = await db
      .insert(schema.driverLocation)
      .values({
        driverId: userId,
        lat: input.lat,
        lng: input.lng,
        heading: input.heading,
        speed: input.speed,
      })
      .returning();

    return { location };
  }

  async getNearbyDrivers(lat: number, lng: number, radiusKm: number = 5) {
    // Simple bounding box query (not true distance, but good for demo)
    const latDelta = radiusKm / 111; // ~111km per degree latitude
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    const locations = await db.query.driverLocation.findMany({
      where: (loc, { and, gte, lte }) =>
        and(
          gte(loc.lat, lat - latDelta),
          lte(loc.lat, lat + latDelta),
          gte(loc.lng, lng - lngDelta),
          lte(loc.lng, lng + lngDelta),
        ),
      with: {
        driver: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Get driver profiles for these locations
    const driverIds = locations.map((l) => l.driverId);
    const profiles = await db.query.driverProfile.findMany({
      where: (dp, { and, inArray }) =>
        and(inArray(dp.userId, driverIds), eq(dp.isOnline, true)),
    });

    // Combine data
    return locations
      .map((loc) => {
        const profile = profiles.find((p) => p.userId === loc.driverId);
        if (!profile?.isOnline) return null;
        return {
          driverId: loc.driverId,
          driver: loc.driver,
          vehicle: {
            make: profile.vehicleMake,
            model: profile.vehicleModel,
            color: profile.vehicleColor,
            licensePlate: profile.licensePlate,
          },
          location: {
            lat: loc.lat,
            lng: loc.lng,
            heading: loc.heading,
          },
          rating: profile.rating,
        };
      })
      .filter(Boolean);
  }
}

export const driversService = new DriversService();
