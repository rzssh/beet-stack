import { db, desc, eq, and, or, sql } from "@acme/db";
import * as schema from "@acme/db/schema";

interface RequestRideInput {
  riderId: string;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffAddress: string;
}

interface RateRideInput {
  rideId: string;
  rating: number;
  feedback?: string;
}

// Simple price calculation (for demo)
function calculatePrice(distanceKm: number): number {
  const baseFare = 2.5;
  const perKmRate = 1.5;
  return Math.round((baseFare + distanceKm * perKmRate) * 100) / 100;
}

// Haversine distance calculation
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class RidesService {
  async getById(id: string) {
    return db.query.ride.findFirst({
      where: eq(schema.ride.id, id),
      with: {
        rider: { columns: { id: true, name: true, image: true } },
        driver: { columns: { id: true, name: true, image: true } },
      },
    });
  }

  async getActiveRide(userId: string) {
    return db.query.ride.findFirst({
      where: and(
        or(eq(schema.ride.riderId, userId), eq(schema.ride.driverId, userId)),
        sql`${schema.ride.status} IN ('requested', 'accepted', 'driver_arrived', 'in_progress')`,
      ),
      with: {
        rider: { columns: { id: true, name: true, image: true } },
        driver: { columns: { id: true, name: true, image: true } },
      },
    });
  }

  async getHistory(userId: string, mode: "rider" | "driver", limit = 20) {
    const whereClause =
      mode === "rider"
        ? eq(schema.ride.riderId, userId)
        : eq(schema.ride.driverId, userId);

    return db.query.ride.findMany({
      where: whereClause,
      orderBy: desc(schema.ride.createdAt),
      limit,
      with: {
        rider: { columns: { id: true, name: true, image: true } },
        driver: { columns: { id: true, name: true, image: true } },
      },
    });
  }

  async requestRide(input: RequestRideInput) {
    const activeRide = await this.getActiveRide(input.riderId);
    if (activeRide) return { error: "active_ride_exists" as const };

    const distanceKm = calculateDistance(
      input.pickupLat,
      input.pickupLng,
      input.dropoffLat,
      input.dropoffLng,
    );
    const estimatedPrice = calculatePrice(distanceKm);
    const estimatedDurationMin = Math.round(distanceKm * 2);

    const [ride] = await db
      .insert(schema.ride)
      .values({
        riderId: input.riderId,
        status: "requested",
        pickupLat: input.pickupLat,
        pickupLng: input.pickupLng,
        pickupAddress: input.pickupAddress,
        dropoffLat: input.dropoffLat,
        dropoffLng: input.dropoffLng,
        dropoffAddress: input.dropoffAddress,
        estimatedPrice,
        estimatedDistanceKm: Math.round(distanceKm * 100) / 100,
        estimatedDurationMin,
      })
      .returning();

    if (!ride) return { error: "create_failed" as const };
    return { ride };
  }

  async acceptRide(rideId: string, driverId: string) {
    const ride = await this.getById(rideId);
    if (!ride) return { error: "ride_not_found" as const };
    if (ride.status !== "requested") return { error: "ride_not_available" as const };

    const activeRide = await this.getActiveRide(driverId);
    if (activeRide) return { error: "active_ride_exists" as const };

    const driverProfile = await db.query.driverProfile.findFirst({
      where: eq(schema.driverProfile.userId, driverId),
    });
    if (!driverProfile) return { error: "no_driver_profile" as const };
    if (!driverProfile.isOnline) return { error: "not_online" as const };

    const [updated] = await db
      .update(schema.ride)
      .set({ driverId, status: "accepted", acceptedAt: new Date() })
      .where(eq(schema.ride.id, rideId))
      .returning();

    return { ride: updated };
  }

  async driverArrived(rideId: string, driverId: string) {
    const ride = await this.getById(rideId);
    if (!ride) return { error: "ride_not_found" as const };
    if (ride.driverId !== driverId) return { error: "not_authorized" as const };
    if (ride.status !== "accepted") return { error: "invalid_status" as const };

    const [updated] = await db
      .update(schema.ride)
      .set({ status: "driver_arrived", arrivedAt: new Date() })
      .where(eq(schema.ride.id, rideId))
      .returning();

    return { ride: updated };
  }

  async startRide(rideId: string, driverId: string) {
    const ride = await this.getById(rideId);
    if (!ride) return { error: "ride_not_found" as const };
    if (ride.driverId !== driverId) return { error: "not_authorized" as const };
    if (ride.status !== "driver_arrived") return { error: "invalid_status" as const };

    const [updated] = await db
      .update(schema.ride)
      .set({ status: "in_progress", startedAt: new Date() })
      .where(eq(schema.ride.id, rideId))
      .returning();

    return { ride: updated };
  }

  async completeRide(rideId: string, driverId: string) {
    const ride = await this.getById(rideId);
    if (!ride) return { error: "ride_not_found" as const };
    if (ride.driverId !== driverId) return { error: "not_authorized" as const };
    if (ride.status !== "in_progress") return { error: "invalid_status" as const };

    const startedAt = ride.startedAt ?? new Date();
    const actualDurationMin = Math.round((Date.now() - startedAt.getTime()) / 60000);
    const finalPrice = ride.estimatedPrice ?? 0;

    const [updated] = await db
      .update(schema.ride)
      .set({ status: "completed", completedAt: new Date(), actualDurationMin, finalPrice })
      .where(eq(schema.ride.id, rideId))
      .returning();

    await db
      .update(schema.driverProfile)
      .set({ totalRides: sql`${schema.driverProfile.totalRides} + 1` })
      .where(eq(schema.driverProfile.userId, driverId));

    return { ride: updated };
  }

  async cancelRide(rideId: string, userId: string, reason?: string) {
    const ride = await this.getById(rideId);
    if (!ride) return { error: "ride_not_found" as const };
    if (ride.riderId !== userId && ride.driverId !== userId) {
      return { error: "not_authorized" as const };
    }
    if (ride.status === "completed" || ride.status === "cancelled") {
      return { error: "cannot_cancel" as const };
    }

    const [updated] = await db
      .update(schema.ride)
      .set({ status: "cancelled", cancelledAt: new Date(), cancelReason: reason })
      .where(eq(schema.ride.id, rideId))
      .returning();

    return { ride: updated };
  }

  async rateRide(input: RateRideInput, userId: string, role: "rider" | "driver") {
    const ride = await this.getById(input.rideId);
    if (!ride) return { error: "ride_not_found" as const };
    if (ride.status !== "completed") return { error: "invalid_status" as const };

    if (role === "rider") {
      if (ride.riderId !== userId) return { error: "not_authorized" as const };
      if (ride.driverRating) return { error: "already_rated" as const };

      const [updated] = await db
        .update(schema.ride)
        .set({ driverRating: input.rating, driverFeedback: input.feedback })
        .where(eq(schema.ride.id, input.rideId))
        .returning();

      if (ride.driverId) await this.updateDriverRating(ride.driverId);
      return { ride: updated };
    }

    if (ride.driverId !== userId) return { error: "not_authorized" as const };
    if (ride.riderRating) return { error: "already_rated" as const };

    const [updated] = await db
      .update(schema.ride)
      .set({ riderRating: input.rating, riderFeedback: input.feedback })
      .where(eq(schema.ride.id, input.rideId))
      .returning();

    return { ride: updated };
  }

  private async updateDriverRating(driverId: string) {
    // Calculate new average rating from completed rides
    const result = await db
      .select({
        avgRating: sql<number>`AVG(${schema.ride.driverRating})`,
      })
      .from(schema.ride)
      .where(
        and(
          eq(schema.ride.driverId, driverId),
          eq(schema.ride.status, "completed"),
          sql`${schema.ride.driverRating} IS NOT NULL`,
        ),
      );

    const avgRating = result[0]?.avgRating ?? 5.0;

    await db
      .update(schema.driverProfile)
      .set({ rating: avgRating })
      .where(eq(schema.driverProfile.userId, driverId));
  }

  // Get pending ride requests for drivers (near their location)
  async getPendingRequests(lat: number, lng: number, radiusKm: number = 10) {
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    return db.query.ride.findMany({
      where: and(
        eq(schema.ride.status, "requested"),
        sql`${schema.ride.pickupLat} BETWEEN ${lat - latDelta} AND ${lat + latDelta}`,
        sql`${schema.ride.pickupLng} BETWEEN ${lng - lngDelta} AND ${lng + lngDelta}`,
      ),
      orderBy: desc(schema.ride.requestedAt),
      with: {
        rider: {
          columns: { id: true, name: true, image: true },
        },
      },
    });
  }
}

export const ridesService = new RidesService();
