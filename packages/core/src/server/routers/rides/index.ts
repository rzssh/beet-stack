import { Elysia } from "elysia";
import { createAttachMiddleware } from "~/server/middleware/attach";
import {
  cancelRideInput,
  pendingRequestsQuery,
  rateRideInput,
  requestRideInput,
  rideHistoryQuery,
  rideIdParams,
  rideModel,
} from "~/server/schema/ride";
import { ridesService } from "./service";

export const ridesRoutes = new Elysia({ prefix: "/rides" })
  .use(createAttachMiddleware())
  .decorate("ridesService", ridesService)
  .model({
    ride: rideModel,
    requestRide: requestRideInput,
    rideIdParams: rideIdParams,
    cancelRide: cancelRideInput,
    rateRide: rateRideInput,
    rideHistoryQuery: rideHistoryQuery,
    pendingRequestsQuery: pendingRequestsQuery,
  })
  .guard({ auth: true }, (app) =>
    app
      // Request a new ride (as rider)
      .post(
        "/request",
        async ({ body, user, ridesService }) => {
          const ride = await ridesService.requestRide({
            riderId: user.id,
            ...body,
          });
          return { success: true, ride };
        },
        {
          body: "requestRide",
          detail: {
            summary: "Request a new ride",
            tags: ["Rides"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      // Get active ride for current user
      .get(
        "/active",
        async ({ user, ridesService }) => {
          const ride = await ridesService.getActiveRide(user.id);
          return { success: true, ride };
        },
        {
          detail: {
            summary: "Get user's active ride",
            tags: ["Rides"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      // Get ride history
      .get(
        "/history",
        async ({ query, user, ridesService }) => {
          const mode = query.mode ?? "rider";
          const limit = query.limit ? Number(query.limit) : undefined;
          const rides = await ridesService.getHistory(user.id, mode, limit);
          return { success: true, rides };
        },
        {
          query: "rideHistoryQuery",
          detail: {
            summary: "Get ride history",
            tags: ["Rides"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      // Get pending ride requests near driver (for driver mode)
      .get(
        "/pending",
        async ({ query, ridesService }) => {
          const rides = await ridesService.getPendingRequests(
            Number(query.lat),
            Number(query.lng),
            query.radius ? Number(query.radius) : undefined,
          );
          return { success: true, rides };
        },
        {
          query: "pendingRequestsQuery",
          detail: {
            summary: "Get pending ride requests near location",
            tags: ["Rides"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      // Get ride by ID
      .get(
        "/:id",
        async ({ params, ridesService }) => {
          const ride = await ridesService.getByIdOrFail(params.id);
          return { success: true, ride };
        },
        {
          params: "rideIdParams",
          detail: {
            summary: "Get ride details",
            tags: ["Rides"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      // Accept a ride (as driver)
      .post(
        "/:id/accept",
        async ({ params, user, ridesService }) => {
          const ride = await ridesService.acceptRide(params.id, user.id);
          return { success: true, ride };
        },
        {
          params: "rideIdParams",
          detail: {
            summary: "Accept a ride request",
            tags: ["Rides"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      // Driver arrived at pickup
      .post(
        "/:id/arrived",
        async ({ params, user, ridesService }) => {
          const ride = await ridesService.driverArrived(params.id, user.id);
          return { success: true, ride };
        },
        {
          params: "rideIdParams",
          detail: {
            summary: "Mark driver as arrived at pickup",
            tags: ["Rides"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      // Start the ride
      .post(
        "/:id/start",
        async ({ params, user, ridesService }) => {
          const ride = await ridesService.startRide(params.id, user.id);
          return { success: true, ride };
        },
        {
          params: "rideIdParams",
          detail: {
            summary: "Start the ride",
            tags: ["Rides"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      // Complete the ride
      .post(
        "/:id/complete",
        async ({ params, user, ridesService }) => {
          const ride = await ridesService.completeRide(params.id, user.id);
          return { success: true, ride };
        },
        {
          params: "rideIdParams",
          detail: {
            summary: "Complete the ride",
            tags: ["Rides"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      // Cancel the ride
      .post(
        "/:id/cancel",
        async ({ params, body, user, ridesService }) => {
          const ride = await ridesService.cancelRide(
            params.id,
            user.id,
            body.reason,
          );
          return { success: true, ride };
        },
        {
          params: "rideIdParams",
          body: "cancelRide",
          detail: {
            summary: "Cancel the ride",
            tags: ["Rides"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      // Rate the ride (as rider - rates driver)
      .post(
        "/:id/rate/driver",
        async ({ params, body, user, ridesService }) => {
          const ride = await ridesService.rateRide(
            { rideId: params.id, ...body },
            user.id,
            "rider",
          );
          return { success: true, ride };
        },
        {
          params: "rideIdParams",
          body: "rateRide",
          detail: {
            summary: "Rate the driver",
            tags: ["Rides"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      // Rate the ride (as driver - rates rider)
      .post(
        "/:id/rate/rider",
        async ({ params, body, user, ridesService }) => {
          const ride = await ridesService.rateRide(
            { rideId: params.id, ...body },
            user.id,
            "driver",
          );
          return { success: true, ride };
        },
        {
          params: "rideIdParams",
          body: "rateRide",
          detail: {
            summary: "Rate the rider",
            tags: ["Rides"],
            security: [{ BearerAuth: [] }],
          },
        },
      ),
  );
