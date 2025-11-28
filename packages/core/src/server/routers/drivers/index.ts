import { Elysia } from "elysia";
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
  // Public endpoint - get nearby drivers
  .get(
    "/nearby",
    async ({ query, driversService }) => {
      const drivers = await driversService.getNearbyDrivers(
        Number(query.lat),
        Number(query.lng),
        query.radius ? Number(query.radius) : undefined,
      );
      return { success: true, drivers };
    },
    {
      query: "nearbyDriversQuery",
      detail: {
        summary: "Get nearby online drivers",
        tags: ["Drivers"],
      },
    },
  )
  // Protected endpoints
  .guard({ auth: true }, (app) =>
    app
      .get(
        "/profile",
        async ({ user, driversService }) => {
          const profile = await driversService.getProfile(user.id);
          return { success: true, profile };
        },
        {
          detail: {
            summary: "Get current user's driver profile",
            tags: ["Drivers"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      .post(
        "/profile",
        async ({ body, user, driversService }) => {
          const profile = await driversService.createProfile({
            userId: user.id,
            ...body,
          });
          return { success: true, profile };
        },
        {
          body: "createDriverProfile",
          detail: {
            summary: "Create driver profile",
            tags: ["Drivers"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      .patch(
        "/profile",
        async ({ body, user, driversService }) => {
          const profile = await driversService.updateProfile(user.id, body);
          return { success: true, profile };
        },
        {
          body: "updateDriverProfile",
          detail: {
            summary: "Update driver profile",
            tags: ["Drivers"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      .post(
        "/go-online",
        async ({ user, driversService }) => {
          const profile = await driversService.goOnline(user.id);
          return { success: true, profile };
        },
        {
          detail: {
            summary: "Set driver status to online",
            tags: ["Drivers"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      .post(
        "/go-offline",
        async ({ user, driversService }) => {
          const profile = await driversService.goOffline(user.id);
          return { success: true, profile };
        },
        {
          detail: {
            summary: "Set driver status to offline",
            tags: ["Drivers"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      .post(
        "/location",
        async ({ body, user, driversService }) => {
          const location = await driversService.updateLocation(user.id, body);
          return { success: true, location };
        },
        {
          body: "updateLocation",
          detail: {
            summary: "Update driver location",
            tags: ["Drivers"],
            security: [{ BearerAuth: [] }],
          },
        },
      ),
  );
