import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const message = pgTable("messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const note = pgTable("notes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  title: text("title").notNull(),
  body: text("body").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const userProfile = pgTable("user_profile", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  phone: text("phone"),
  profileImageUrl: text("profile_image_url"),
  preferredMode: text("preferred_mode").default("rider"),
  rating: doublePrecision("rating").default(5.0),
  totalRidesAsRider: integer("total_rides_as_rider").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const driverProfile = pgTable("driver_profile", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  vehicleMake: text("vehicle_make").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  vehicleYear: text("vehicle_year").notNull(),
  vehicleColor: text("vehicle_color").notNull(),
  licensePlate: text("license_plate").notNull(),
  licenseImageUrl: text("license_image_url"),
  insuranceImageUrl: text("insurance_image_url"),
  vehicleImageUrl: text("vehicle_image_url"),
  isVerified: boolean("is_verified").default(false).notNull(),
  isOnline: boolean("is_online").default(false).notNull(),
  rating: doublePrecision("rating").default(5.0),
  totalRides: integer("total_rides").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const ride = pgTable("ride", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  riderId: text("rider_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  driverId: text("driver_id").references(() => user.id, { onDelete: "set null" }),
  status: text("status").notNull().default("requested"),
  pickupLat: doublePrecision("pickup_lat").notNull(),
  pickupLng: doublePrecision("pickup_lng").notNull(),
  pickupAddress: text("pickup_address").notNull(),
  dropoffLat: doublePrecision("dropoff_lat").notNull(),
  dropoffLng: doublePrecision("dropoff_lng").notNull(),
  dropoffAddress: text("dropoff_address").notNull(),
  estimatedPrice: doublePrecision("estimated_price"),
  finalPrice: doublePrecision("final_price"),
  currency: text("currency").default("USD"),
  estimatedDistanceKm: doublePrecision("estimated_distance_km"),
  estimatedDurationMin: integer("estimated_duration_min"),
  actualDistanceKm: doublePrecision("actual_distance_km"),
  actualDurationMin: integer("actual_duration_min"),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  arrivedAt: timestamp("arrived_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
  cancelReason: text("cancel_reason"),
  riderRating: integer("rider_rating"),
  driverRating: integer("driver_rating"),
  riderFeedback: text("rider_feedback"),
  driverFeedback: text("driver_feedback"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const driverLocation = pgTable("driver_location", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  driverId: text("driver_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  heading: doublePrecision("heading"),
  speed: doublePrecision("speed"),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const featureFlag = pgTable("feature_flag", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  name: text("name").notNull().unique(),
  description: text("description"),
  isEnabled: boolean("is_enabled").default(false).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const userFeatureFlag = pgTable("user_feature_flag", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  flagId: text("flag_id")
    .notNull()
    .references(() => featureFlag.id, { onDelete: "cascade" }),
  isEnabled: boolean("is_enabled").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messageRelations = relations(message, ({ one }) => ({
  user: one(user, { fields: [message.userId], references: [user.id] }),
}));

export const noteRelations = relations(note, ({ one }) => ({
  user: one(user, { fields: [note.userId], references: [user.id] }),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  messages: many(message),
  notes: many(note),
  userProfile: one(userProfile),
  driverProfile: one(driverProfile),
  driverLocation: one(driverLocation),
  ridesAsRider: many(ride, { relationName: "rider" }),
  ridesAsDriver: many(ride, { relationName: "driver" }),
  featureFlags: many(userFeatureFlag),
}));

export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(user, { fields: [userProfile.userId], references: [user.id] }),
}));

export const driverProfileRelations = relations(driverProfile, ({ one }) => ({
  user: one(user, { fields: [driverProfile.userId], references: [user.id] }),
}));

export const rideRelations = relations(ride, ({ one }) => ({
  rider: one(user, {
    fields: [ride.riderId],
    references: [user.id],
    relationName: "rider",
  }),
  driver: one(user, {
    fields: [ride.driverId],
    references: [user.id],
    relationName: "driver",
  }),
}));

export const driverLocationRelations = relations(driverLocation, ({ one }) => ({
  driver: one(user, { fields: [driverLocation.driverId], references: [user.id] }),
}));

export const featureFlagRelations = relations(featureFlag, ({ many }) => ({
  userFlags: many(userFeatureFlag),
}));

export const userFeatureFlagRelations = relations(userFeatureFlag, ({ one }) => ({
  user: one(user, { fields: [userFeatureFlag.userId], references: [user.id] }),
  flag: one(featureFlag, { fields: [userFeatureFlag.flagId], references: [featureFlag.id] }),
}));

export type Message = typeof message.$inferSelect;
export type NewMessage = typeof message.$inferInsert;
export type Note = typeof note.$inferSelect;
export type NewNote = typeof note.$inferInsert;

export type UserProfile = typeof userProfile.$inferSelect;
export type NewUserProfile = typeof userProfile.$inferInsert;
export type DriverProfile = typeof driverProfile.$inferSelect;
export type NewDriverProfile = typeof driverProfile.$inferInsert;
export type Ride = typeof ride.$inferSelect;
export type NewRide = typeof ride.$inferInsert;
export type DriverLocation = typeof driverLocation.$inferSelect;
export type NewDriverLocation = typeof driverLocation.$inferInsert;
export type FeatureFlag = typeof featureFlag.$inferSelect;
export type NewFeatureFlag = typeof featureFlag.$inferInsert;
export type UserFeatureFlag = typeof userFeatureFlag.$inferSelect;
export type NewUserFeatureFlag = typeof userFeatureFlag.$inferInsert;

export type RideStatus =
  | "requested"
  | "accepted"
  | "driver_arrived"
  | "in_progress"
  | "completed"
  | "cancelled";

export type UserMode = "rider" | "driver";
