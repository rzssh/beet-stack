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
      .post(
        "/request",
        async ({ body, user, ridesService, status }) => {
          const result = await ridesService.requestRide({
            riderId: user.id,
            ...body,
          });
          if (result.error) {
            if (result.error === "active_ride_exists") {
              return status(400, {
                message: "You already have an active ride",
              });
            }
            return status(500, { message: "Failed to create ride" });
          }
          return result.ride;
        },
        { body: "requestRide" },
      )
      .get("/active", async ({ user, ridesService }) => {
        return ridesService.getActiveRide(user.id);
      })
      .get(
        "/history",
        async ({ query, user, ridesService }) => {
          const mode = query.mode ?? "rider";
          const limit = query.limit ? Number(query.limit) : undefined;
          return ridesService.getHistory(user.id, mode, limit);
        },
        { query: "rideHistoryQuery" },
      )
      .get(
        "/pending",
        async ({ query, ridesService }) => {
          return ridesService.getPendingRequests(
            Number(query.lat),
            Number(query.lng),
            query.radius ? Number(query.radius) : undefined,
          );
        },
        { query: "pendingRequestsQuery" },
      )
      .get(
        "/:id",
        async ({ params, ridesService, status }) => {
          const ride = await ridesService.getById(params.id);
          if (!ride) return status(400, { message: "Ride not found" });
          return ride;
        },
        { params: "rideIdParams" },
      )
      .post(
        "/:id/accept",
        async ({ params, user, ridesService, status }) => {
          const result = await ridesService.acceptRide(params.id, user.id);
          if (result.error) {
            const messages: Record<string, string> = {
              ride_not_found: "Ride not found",
              ride_not_available: "Ride is no longer available",
              active_ride_exists: "You already have an active ride",
              no_driver_profile: "Driver profile not found",
              not_online: "Driver must be online to accept rides",
            };
            return status(400, {
              message: messages[result.error] ?? "Cannot accept ride",
            });
          }
          return result.ride;
        },
        { params: "rideIdParams" },
      )
      .post(
        "/:id/arrived",
        async ({ params, user, ridesService, status }) => {
          const result = await ridesService.driverArrived(params.id, user.id);
          if (result.error) {
            const messages: Record<string, string> = {
              ride_not_found: "Ride not found",
              not_authorized: "Not authorized for this ride",
              invalid_status: "Invalid ride status",
            };
            return status(400, {
              message: messages[result.error] ?? "Cannot mark arrived",
            });
          }
          return result.ride;
        },
        { params: "rideIdParams" },
      )
      .post(
        "/:id/start",
        async ({ params, user, ridesService, status }) => {
          const result = await ridesService.startRide(params.id, user.id);
          if (result.error) {
            const messages: Record<string, string> = {
              ride_not_found: "Ride not found",
              not_authorized: "Not authorized for this ride",
              invalid_status: "Driver must arrive before starting ride",
            };
            return status(400, {
              message: messages[result.error] ?? "Cannot start ride",
            });
          }
          return result.ride;
        },
        { params: "rideIdParams" },
      )
      .post(
        "/:id/complete",
        async ({ params, user, ridesService, status }) => {
          const result = await ridesService.completeRide(params.id, user.id);
          if (result.error) {
            const messages: Record<string, string> = {
              ride_not_found: "Ride not found",
              not_authorized: "Not authorized for this ride",
              invalid_status: "Ride must be in progress to complete",
            };
            return status(400, {
              message: messages[result.error] ?? "Cannot complete ride",
            });
          }
          return result.ride;
        },
        { params: "rideIdParams" },
      )
      .post(
        "/:id/cancel",
        async ({ params, body, user, ridesService, status }) => {
          const result = await ridesService.cancelRide(
            params.id,
            user.id,
            body.reason,
          );
          if (result.error) {
            const messages: Record<string, string> = {
              ride_not_found: "Ride not found",
              not_authorized: "Not authorized to cancel this ride",
              cannot_cancel: "Cannot cancel this ride",
            };
            return status(400, {
              message: messages[result.error] ?? "Cannot cancel ride",
            });
          }
          return result.ride;
        },
        { params: "rideIdParams", body: "cancelRide" },
      )
      .post(
        "/:id/rate/driver",
        async ({ params, body, user, ridesService, status }) => {
          const result = await ridesService.rateRide(
            { rideId: params.id, ...body },
            user.id,
            "rider",
          );
          if (result.error) {
            const messages: Record<string, string> = {
              ride_not_found: "Ride not found",
              not_authorized: "Not authorized to rate this ride",
              invalid_status: "Can only rate completed rides",
              already_rated: "You already rated this ride",
            };
            return status(400, {
              message: messages[result.error] ?? "Cannot rate",
            });
          }
          return result.ride;
        },
        { params: "rideIdParams", body: "rateRide" },
      )
      .post(
        "/:id/rate/rider",
        async ({ params, body, user, ridesService, status }) => {
          const result = await ridesService.rateRide(
            { rideId: params.id, ...body },
            user.id,
            "driver",
          );
          if (result.error) {
            const messages: Record<string, string> = {
              ride_not_found: "Ride not found",
              not_authorized: "Not authorized to rate this ride",
              invalid_status: "Can only rate completed rides",
              already_rated: "You already rated this ride",
            };
            return status(400, {
              message: messages[result.error] ?? "Cannot rate",
            });
          }
          return result.ride;
        },
        { params: "rideIdParams", body: "rateRide" },
      ),
  );
