import { Elysia, status } from "elysia";
import { createAttachMiddleware } from "~/server/middleware/attach";
import {
  createDriverProfileInput,
  driverLocationModel,
  driverProfileModel,
  nearbyDriversQuery,
  updateDriverProfileInput,
  updateLocationInput,
} from "~/server/schema/driver";
import { driversService } from "./service";

export const driversRoutes = new Elysia({ prefix: "/drivers" })
  .use(createAttachMiddleware())
  .decorate("driversService", driversService)
  .model({
    driverProfile: driverProfileModel,
    createDriverProfile: createDriverProfileInput,
    updateDriverProfile: updateDriverProfileInput,
    updateLocation: updateLocationInput,
    nearbyDriversQuery: nearbyDriversQuery,
    driverLocation: driverLocationModel,
  })
  .get(
    "/nearby",
    async ({ query, driversService }) => {
      return driversService.getNearbyDrivers(
        Number(query.lat),
        Number(query.lng),
        query.radius ? Number(query.radius) : undefined,
      );
    },
    { query: "nearbyDriversQuery" },
  )
  .guard({ auth: true }, (app) =>
    app
      .get("/profile", async ({ user, driversService }) => {
        const profile = await driversService.getProfile(user.id);
        if (!profile) {
          return status(400, { message: "Driver profile not found" });
        }
        return profile;
      })
      .post(
        "/profile",
        async ({ body, user, driversService, status }) => {
          const result = await driversService.createProfile({
            userId: user.id,
            ...body,
          });
          if ("error" in result) {
            if (result.error === "conflict") {
              return status(409, { message: "Driver profile already exists" });
            }
            return status(500, { message: "Failed to create profile" });
          }
          return result.profile;
        },
        { body: "createDriverProfile" },
      )
      .patch(
        "/profile",
        async ({ body, user, driversService, status }) => {
          const profile = await driversService.updateProfile(user.id, body);
          if (!profile)
            return status(400, { message: "Driver profile not found" });
          return profile;
        },
        { body: "updateDriverProfile" },
      )
      .post("/go-online", async ({ user, driversService, status }) => {
        const profile = await driversService.goOnline(user.id);
        if (!profile)
          return status(400, { message: "Driver profile not found" });
        return profile;
      })
      .post("/go-offline", async ({ user, driversService, status }) => {
        const profile = await driversService.goOffline(user.id);
        if (!profile)
          return status(400, { message: "Driver profile not found" });
        return profile;
      })
      .post(
        "/location",
        async ({ body, user, driversService, status }) => {
          const result = await driversService.updateLocation(user.id, body);
          if ("error" in result) {
            if (result.error === "not_found") {
              return status(400, { message: "Driver profile not found" });
            }
            if (result.error === "not_online") {
              return status(400, {
                message: "Driver must be online to update location",
              });
            }
          }
          return result.location;
        },
        { body: "updateLocation" },
      ),
  );
