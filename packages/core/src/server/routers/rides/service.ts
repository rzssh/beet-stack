import { db, desc, eq, and, or, sql } from "@acme/db";
import * as schema from "@acme/db/schema";
import type { RideStatus } from "@acme/db/schema";
import { AppError, AuthorizationError, NotFoundError } from "~/server/errors";

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

const ACTIVE_STATUSES: RideStatus[] = [
  "requested",
  "accepted",
  "driver_arrived",
  "in_progress",
];

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
        rider: {
          columns: { id: true, name: true, image: true },
        },
        driver: {
          columns: { id: true, name: true, image: true },
        },
      },
    });
  }

  async getByIdOrFail(id: string) {
    const ride = await this.getById(id);
    if (!ride) {
      throw new NotFoundError("Ride", { rideId: id });
    }
    return ride;
  }

  async getActiveRide(userId: string) {
    // Check if user has an active ride (as rider or driver)
    return db.query.ride.findFirst({
      where: and(
        or(eq(schema.ride.riderId, userId), eq(schema.ride.driverId, userId)),
        sql`${schema.ride.status} IN ('requested', 'accepted', 'driver_arrived', 'in_progress')`,
      ),
      with: {
        rider: {
          columns: { id: true, name: true, image: true },
        },
        driver: {
          columns: { id: true, name: true, image: true },
        },
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
        rider: {
          columns: { id: true, name: true, image: true },
        },
        driver: {
          columns: { id: true, name: true, image: true },
        },
      },
    });
  }

  async requestRide(input: RequestRideInput) {
    // Check if rider already has an active ride
    const activeRide = await this.getActiveRide(input.riderId);
    if (activeRide) {
      throw new AppError("You already have an active ride", 400, "ACTIVE_RIDE_EXISTS");
    }

    // Calculate distance and price estimate
    const distanceKm = calculateDistance(
      input.pickupLat,
      input.pickupLng,
      input.dropoffLat,
      input.dropoffLng,
    );
    const estimatedPrice = calculatePrice(distanceKm);
    const estimatedDurationMin = Math.round(distanceKm * 2); // Rough estimate: 2 min per km

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

    if (!ride) {
      throw new AppError("Failed to create ride request", 500, "CREATE_FAILED");
    }

    return ride;
  }

  async acceptRide(rideId: string, driverId: string) {
    const ride = await this.getByIdOrFail(rideId);

    if (ride.status !== "requested") {
      throw new AppError("Ride is no longer available", 400, "RIDE_NOT_AVAILABLE");
    }

    // Check if driver has an active ride
    const activeRide = await this.getActiveRide(driverId);
    if (activeRide) {
      throw new AppError("You already have an active ride", 400, "ACTIVE_RIDE_EXISTS");
    }

    // Verify driver has a profile
    const driverProfile = await db.query.driverProfile.findFirst({
      where: eq(schema.driverProfile.userId, driverId),
    });
    if (!driverProfile) {
      throw new AppError("Driver profile not found", 400, "NO_DRIVER_PROFILE");
    }
    if (!driverProfile.isOnline) {
      throw new AppError("Driver must be online to accept rides", 400, "NOT_ONLINE");
    }

    const [updated] = await db
      .update(schema.ride)
      .set({
        driverId,
        status: "accepted",
        acceptedAt: new Date(),
      })
      .where(eq(schema.ride.id, rideId))
      .returning();

    return updated;
  }

  async driverArrived(rideId: string, driverId: string) {
    const ride = await this.getByIdOrFail(rideId);

    if (ride.driverId !== driverId) {
      throw new AuthorizationError("Not authorized for this ride");
    }
    if (ride.status !== "accepted") {
      throw new AppError("Invalid ride status", 400, "INVALID_STATUS");
    }

    const [updated] = await db
      .update(schema.ride)
      .set({
        status: "driver_arrived",
        arrivedAt: new Date(),
      })
      .where(eq(schema.ride.id, rideId))
      .returning();

    return updated;
  }

  async startRide(rideId: string, driverId: string) {
    const ride = await this.getByIdOrFail(rideId);

    if (ride.driverId !== driverId) {
      throw new AuthorizationError("Not authorized for this ride");
    }
    if (ride.status !== "driver_arrived") {
      throw new AppError("Driver must arrive before starting ride", 400, "INVALID_STATUS");
    }

    const [updated] = await db
      .update(schema.ride)
      .set({
        status: "in_progress",
        startedAt: new Date(),
      })
      .where(eq(schema.ride.id, rideId))
      .returning();

    return updated;
  }

  async completeRide(rideId: string, driverId: string) {
    const ride = await this.getByIdOrFail(rideId);

    if (ride.driverId !== driverId) {
      throw new AuthorizationError("Not authorized for this ride");
    }
    if (ride.status !== "in_progress") {
      throw new AppError("Ride must be in progress to complete", 400, "INVALID_STATUS");
    }

    // Calculate actual duration and final price
    const startedAt = ride.startedAt ?? new Date();
    const actualDurationMin = Math.round(
      (Date.now() - startedAt.getTime()) / 60000,
    );
    const finalPrice = ride.estimatedPrice ?? 0;

    const [updated] = await db
      .update(schema.ride)
      .set({
        status: "completed",
        completedAt: new Date(),
        actualDurationMin,
        finalPrice,
      })
      .where(eq(schema.ride.id, rideId))
      .returning();

    // Update driver stats
    await db
      .update(schema.driverProfile)
      .set({
        totalRides: sql`${schema.driverProfile.totalRides} + 1`,
      })
      .where(eq(schema.driverProfile.userId, driverId));

    return updated;
  }

  async cancelRide(rideId: string, userId: string, reason?: string) {
    const ride = await this.getByIdOrFail(rideId);

    // Only rider or driver can cancel
    if (ride.riderId !== userId && ride.driverId !== userId) {
      throw new AuthorizationError("Not authorized to cancel this ride");
    }

    // Can only cancel if not completed
    if (ride.status === "completed" || ride.status === "cancelled") {
      throw new AppError("Cannot cancel this ride", 400, "CANNOT_CANCEL");
    }

    const [updated] = await db
      .update(schema.ride)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
        cancelReason: reason,
      })
      .where(eq(schema.ride.id, rideId))
      .returning();

    return updated;
  }

  async rateRide(input: RateRideInput, userId: string, role: "rider" | "driver") {
    const ride = await this.getByIdOrFail(input.rideId);

    if (ride.status !== "completed") {
      throw new AppError("Can only rate completed rides", 400, "INVALID_STATUS");
    }

    if (role === "rider") {
      if (ride.riderId !== userId) {
        throw new AuthorizationError("Not authorized to rate this ride");
      }
      if (ride.driverRating) {
        throw new AppError("You already rated this ride", 400, "ALREADY_RATED");
      }

      const [updated] = await db
        .update(schema.ride)
        .set({
          driverRating: input.rating,
          driverFeedback: input.feedback,
        })
        .where(eq(schema.ride.id, input.rideId))
        .returning();

      // Update driver's average rating
      if (ride.driverId) {
        await this.updateDriverRating(ride.driverId);
      }

      return updated;
    } else {
      if (ride.driverId !== userId) {
        throw new AuthorizationError("Not authorized to rate this ride");
      }
      if (ride.riderRating) {
        throw new AppError("You already rated this ride", 400, "ALREADY_RATED");
      }

      const [updated] = await db
        .update(schema.ride)
        .set({
          riderRating: input.rating,
          riderFeedback: input.feedback,
        })
        .where(eq(schema.ride.id, input.rideId))
        .returning();

      return updated;
    }
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
