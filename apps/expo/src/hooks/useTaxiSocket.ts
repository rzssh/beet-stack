import { useCallback, useEffect, useRef, useState } from "react";
import { getMicroserviceUrl } from "~/utils/base-url";

type TaxiMessageType =
  | "connected"
  | "driver:registered"
  | "rider:registered"
  | "driver:location"
  | "ride:subscribed"
  | "ride:unsubscribed"
  | "ride:status"
  | "ride:new_request"
  | "error";

interface TaxiMessage {
  type: TaxiMessageType;
  payload?: unknown;
  timestamp?: number;
}

interface DriverLocation {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
}

interface RideStatus {
  rideId: string;
  status: string;
  riderId?: string;
  driverId?: string;
}

interface RideRequest {
  rideId: string;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffAddress: string;
  estimatedPrice: number;
}

interface UseTaxiSocketOptions {
  userId: string;
  role: "rider" | "driver";
  onDriverLocation?: (location: DriverLocation) => void;
  onRideStatus?: (status: RideStatus) => void;
  onNewRideRequest?: (request: RideRequest) => void;
  autoConnect?: boolean;
}

interface UseTaxiSocketResult {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  sendLocation: (lat: number, lng: number, heading?: number, speed?: number) => void;
  subscribeToRide: (rideId: string) => void;
  unsubscribeFromRide: (rideId: string) => void;
}

export function useTaxiSocket(options: UseTaxiSocketOptions): UseTaxiSocketResult {
  const {
    userId,
    role,
    onDriverLocation,
    onRideStatus,
    onNewRideRequest,
    autoConnect = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getWebSocketUrl = useCallback(() => {
    const baseUrl = getMicroserviceUrl();
    return baseUrl.replace("http://", "ws://").replace("https://", "wss://") + "/taxi";
  }, []);

  const send = useCallback((message: { type: string; payload?: unknown }) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const handleMessage = useCallback(
    (event: { data: string }) => {
      try {
        const message = JSON.parse(event.data) as TaxiMessage;

        switch (message.type) {
          case "driver:location":
            onDriverLocation?.(message.payload as DriverLocation);
            break;
          case "ride:status":
            onRideStatus?.(message.payload as RideStatus);
            break;
          case "ride:new_request":
            onNewRideRequest?.(message.payload as RideRequest);
            break;
        }
      } catch {
        // Invalid JSON
      }
    },
    [onDriverLocation, onRideStatus, onNewRideRequest],
  );

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(getWebSocketUrl());

    ws.onopen = () => {
      setIsConnected(true);
      send({
        type: role === "driver" ? "driver:register" : "rider:register",
        payload: { [role === "driver" ? "driverId" : "riderId"]: userId },
      });
    };

    ws.onmessage = (event) => {
      if (event.data) {
        handleMessage({ data: event.data });
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, [getWebSocketUrl, handleMessage, role, send, userId]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
  }, []);

  const sendLocation = useCallback(
    (lat: number, lng: number, heading?: number, speed?: number) => {
      send({
        type: "driver:location",
        payload: { driverId: userId, lat, lng, heading, speed },
      });
    },
    [send, userId],
  );

  const subscribeToRide = useCallback(
    (rideId: string) => {
      send({ type: "ride:subscribe", payload: { rideId } });
    },
    [send],
  );

  const unsubscribeFromRide = useCallback(
    (rideId: string) => {
      send({ type: "ride:unsubscribe", payload: { rideId } });
    },
    [send],
  );

  useEffect(() => {
    if (autoConnect && userId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect, userId]);

  return {
    isConnected,
    connect,
    disconnect,
    sendLocation,
    subscribeToRide,
    unsubscribeFromRide,
  };
}
