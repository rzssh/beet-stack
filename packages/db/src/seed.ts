import { account, user } from "./auth-schema";
import { db } from "./client";
import {
  driverLocation,
  driverProfile,
  featureFlag,
  note,
  ride,
  userFeatureFlag,
  userProfile,
} from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

async function createUser(data: { email: string; name: string; password: string }) {
  const newUser = (
    await db
      .insert(user)
      .values({
        id: Bun.randomUUIDv7(),
        email: data.email,
        emailVerified: true,
        name: data.name,
      })
      .returning()
  ).at(0)!;

  const hash = await Bun.password.hash(data.password);
  await db.insert(account).values({
    id: Bun.randomUUIDv7(),
    userId: newUser.id,
    accountId: newUser.id,
    providerId: "credential",
    password: hash,
  });

  return newUser;
}

async function seed() {
  const rider = await createUser({
    email: "rider@taxi.app",
    name: "Alex Rider",
    password: "rider123",
  });

  const driver = await createUser({
    email: "driver@taxi.app",
    name: "Sam Driver",
    password: "driver123",
  });

  const driver2 = await createUser({
    email: "driver2@taxi.app",
    name: "Jordan Wheels",
    password: "driver123",
  });

  await db.insert(userProfile).values([
    {
      userId: rider.id,
      phone: "+1234567890",
      preferredMode: "rider",
      rating: 4.8,
      totalRidesAsRider: 15,
    },
    {
      userId: driver.id,
      phone: "+1987654321",
      preferredMode: "driver",
      rating: 4.9,
      totalRidesAsRider: 3,
    },
    {
      userId: driver2.id,
      phone: "+1555123456",
      preferredMode: "driver",
      rating: 4.7,
      totalRidesAsRider: 0,
    },
  ]);

  await db.insert(driverProfile).values([
    {
      userId: driver.id,
      vehicleMake: "Toyota",
      vehicleModel: "Camry",
      vehicleYear: "2022",
      vehicleColor: "Silver",
      licensePlate: "ABC-1234",
      isVerified: true,
      isOnline: true,
      rating: 4.9,
      totalRides: 156,
    },
    {
      userId: driver2.id,
      vehicleMake: "Honda",
      vehicleModel: "Civic",
      vehicleYear: "2023",
      vehicleColor: "Blue",
      licensePlate: "XYZ-5678",
      isVerified: true,
      isOnline: false,
      rating: 4.7,
      totalRides: 42,
    },
  ]);

  await db.insert(driverLocation).values({
    driverId: driver.id,
    lat: 40.7128,
    lng: -74.006,
    heading: 45,
    speed: 0,
  });

  const completedRide = (
    await db
      .insert(ride)
      .values({
        riderId: rider.id,
        driverId: driver.id,
        status: "completed",
        pickupLat: 40.7128,
        pickupLng: -74.006,
        pickupAddress: "123 Main St, New York, NY",
        dropoffLat: 40.758,
        dropoffLng: -73.9855,
        dropoffAddress: "Times Square, New York, NY",
        estimatedPrice: 25.5,
        finalPrice: 27.0,
        estimatedDistanceKm: 8.2,
        estimatedDurationMin: 15,
        actualDistanceKm: 8.5,
        actualDurationMin: 18,
        acceptedAt: new Date(Date.now() - 3600000),
        arrivedAt: new Date(Date.now() - 3500000),
        startedAt: new Date(Date.now() - 3400000),
        completedAt: new Date(Date.now() - 2300000),
        driverRating: 5,
        riderRating: 5,
      })
      .returning()
  ).at(0)!;

  await db.insert(ride).values({
    riderId: rider.id,
    driverId: driver.id,
    status: "completed",
    pickupLat: 40.758,
    pickupLng: -73.9855,
    pickupAddress: "Times Square, New York, NY",
    dropoffLat: 40.7484,
    dropoffLng: -73.9857,
    dropoffAddress: "Empire State Building, New York, NY",
    estimatedPrice: 12.0,
    finalPrice: 11.5,
    estimatedDistanceKm: 3.1,
    estimatedDurationMin: 8,
    actualDistanceKm: 2.9,
    actualDurationMin: 7,
    acceptedAt: new Date(Date.now() - 86400000),
    arrivedAt: new Date(Date.now() - 86300000),
    startedAt: new Date(Date.now() - 86200000),
    completedAt: new Date(Date.now() - 85700000),
    driverRating: 4,
    riderRating: 5,
  });

  const premiumFlag = (
    await db
      .insert(featureFlag)
      .values([
        {
          name: "premium_rides",
          description: "Access to premium vehicle options",
          isEnabled: false,
        },
        {
          name: "ride_scheduling",
          description: "Schedule rides in advance",
          isEnabled: true,
        },
        {
          name: "multi_stop",
          description: "Add multiple stops to a ride",
          isEnabled: false,
        },
      ])
      .returning()
  ).at(0)!;

  await db.insert(userFeatureFlag).values({
    userId: rider.id,
    flagId: premiumFlag.id,
    isEnabled: true,
  });

  await db.insert(note).values([
    {
      title: "My first note",
      body: "This is my first note",
      userId: rider.id,
    },
    {
      title: "Driver tips",
      body: "Remember to check mirrors frequently",
      userId: driver.id,
    },
  ]);

  console.log("Database seeded successfully!");
  console.log("\nTest accounts:");
  console.log("  Rider: rider@taxi.app / rider123");
  console.log("  Driver 1: driver@taxi.app / driver123");
  console.log("  Driver 2: driver2@taxi.app / driver123");
  process.exit(0);
}

void seed();
