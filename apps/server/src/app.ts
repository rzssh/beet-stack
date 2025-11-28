import {
  countRoutes,
  createServerConfiguration,
  driversRoutes,
  featureFlagsRoutes,
  ridesRoutes,
} from "@acme/core/server";
import { Elysia } from "elysia";
import { auth } from "~/lib/auth";
import { logger } from "~/logger";

interface TaxiMessage {
  type: string;
  payload?: unknown;
}

interface DriverLocationPayload {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
}

interface RideSubscribePayload {
  rideId: string;
}

const driverConnections = new Map<string, unknown>();
const riderConnections = new Map<string, unknown>();
const rideSubscriptions = new Map<string, Set<unknown>>();

function broadcastToRide(rideId: string, message: TaxiMessage) {
  const subscribers = rideSubscriptions.get(rideId);
  if (subscribers) {
    const msgStr = JSON.stringify(message);
    subscribers.forEach((ws: any) => {
      try {
        ws.send(msgStr);
      } catch {
      }
    });
  }
}

// Helper to send to specific user
function sendToUser(userId: string, message: TaxiMessage, isDriver: boolean) {
  const connections = isDriver ? driverConnections : riderConnections;
  const ws = connections.get(userId) as any;
  if (ws) {
    try {
      ws.send(JSON.stringify(message));
    } catch {
      // Connection might be closed
    }
  }
}

export const app = new Elysia()
  .use(createServerConfiguration({ serviceName: "standalone-service", auth, logger }))
  // Legacy WebSocket for backwards compatibility
  .ws("/websocket", {
    open(ws) {
      logger.info("WebSocket connection opened");
      ws.send(JSON.stringify({ type: "connected", timestamp: Date.now() }));
    },
    message(ws, message) {
      logger.info({ message }, "WebSocket message received");
      ws.send(JSON.stringify({ type: "echo", data: message, timestamp: Date.now() }));
    },
    close() {
      logger.info("WebSocket connection closed");
    },
  })
  .ws("/taxi", {
    open(ws: any) {
      logger.info("Taxi WebSocket connection opened");
      ws.send(JSON.stringify({ type: "connected", timestamp: Date.now() }));
    },
    message(ws: any, message: TaxiMessage) {
      logger.info({ type: message.type }, "Taxi message received");

      switch (message.type) {
        // Driver registers their connection
        case "driver:register": {
          const { driverId } = message.payload as { driverId: string };
          if (driverId) {
            driverConnections.set(driverId, ws);
            ws.data = { ...ws.data, driverId, role: "driver" };
            ws.send(JSON.stringify({ type: "driver:registered", payload: { driverId } }));
            logger.info({ driverId }, "Driver registered");
          }
          break;
        }

        // Rider registers their connection
        case "rider:register": {
          const { riderId } = message.payload as { riderId: string };
          if (riderId) {
            riderConnections.set(riderId, ws);
            ws.data = { ...ws.data, riderId, role: "rider" };
            ws.send(JSON.stringify({ type: "rider:registered", payload: { riderId } }));
            logger.info({ riderId }, "Rider registered");
          }
          break;
        }

        // Driver sends location update
        case "driver:location": {
          const payload = message.payload as DriverLocationPayload & { driverId: string };
          if (payload.driverId) {
            // Broadcast to all riders subscribed to this driver's active ride
            // For now, just log it - the mobile app will poll for nearby drivers
            logger.debug({ driverId: payload.driverId, lat: payload.lat, lng: payload.lng }, "Driver location update");

            // If driver has an active ride, broadcast to that ride's subscribers
            const driverId = payload.driverId;
            rideSubscriptions.forEach((subscribers, rideId) => {
              // In production, we'd check if this driver is assigned to this ride
              broadcastToRide(rideId, {
                type: "driver:location",
                payload: { driverId, lat: payload.lat, lng: payload.lng, heading: payload.heading },
              });
            });
          }
          break;
        }

        // Subscribe to ride updates
        case "ride:subscribe": {
          const { rideId } = message.payload as RideSubscribePayload;
          if (rideId) {
            if (!rideSubscriptions.has(rideId)) {
              rideSubscriptions.set(rideId, new Set());
            }
            rideSubscriptions.get(rideId)!.add(ws);
            ws.data = { ...ws.data, subscribedRideId: rideId };
            ws.send(JSON.stringify({ type: "ride:subscribed", payload: { rideId } }));
            logger.info({ rideId }, "Client subscribed to ride");
          }
          break;
        }

        // Unsubscribe from ride updates
        case "ride:unsubscribe": {
          const { rideId } = message.payload as RideSubscribePayload;
          if (rideId) {
            rideSubscriptions.get(rideId)?.delete(ws);
            ws.send(JSON.stringify({ type: "ride:unsubscribed", payload: { rideId } }));
          }
          break;
        }

        // Broadcast ride status change (called by API after status update)
        case "ride:status": {
          const { rideId, status, ...rest } = message.payload as {
            rideId: string;
            status: string;
            riderId?: string;
            driverId?: string;
          };
          if (rideId) {
            broadcastToRide(rideId, { type: "ride:status", payload: { rideId, status, ...rest } });
            logger.info({ rideId, status }, "Ride status broadcasted");
          }
          break;
        }

        // New ride request - notify nearby drivers
        case "ride:new_request": {
          const { rideId, pickupLat, pickupLng, pickupAddress, dropoffAddress, estimatedPrice } =
            message.payload as {
              rideId: string;
              pickupLat: number;
              pickupLng: number;
              pickupAddress: string;
              dropoffAddress: string;
              estimatedPrice: number;
            };

          // Broadcast to all connected drivers (in production, filter by proximity)
          const notification = {
            type: "ride:new_request",
            payload: { rideId, pickupLat, pickupLng, pickupAddress, dropoffAddress, estimatedPrice },
          };
          driverConnections.forEach((driverWs: any) => {
            try {
              driverWs.send(JSON.stringify(notification));
            } catch {
                  }
          });
          logger.info({ rideId }, "New ride request broadcasted to drivers");
          break;
        }

        default:
          ws.send(JSON.stringify({ type: "error", payload: { message: "Unknown message type" } }));
      }
    },
    close(ws: any) {
      // Clean up connections
      const { driverId, riderId, subscribedRideId } = ws.data ?? {};

      if (driverId) {
        driverConnections.delete(driverId);
        logger.info({ driverId }, "Driver disconnected");
      }
      if (riderId) {
        riderConnections.delete(riderId);
        logger.info({ riderId }, "Rider disconnected");
      }
      if (subscribedRideId) {
        rideSubscriptions.get(subscribedRideId)?.delete(ws);
      }

      logger.info("Taxi WebSocket connection closed");
    },
  })
  .use(countRoutes)
  .use(driversRoutes)
  .use(ridesRoutes)
  .use(featureFlagsRoutes);

// Export helpers for use in API routes if needed
export { broadcastToRide, sendToUser };

export type App = typeof app;
