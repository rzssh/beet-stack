import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";

import { logger } from "~/utils/logger";

interface DirectionsParams {
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
}

export interface DirectionsResponse {
  polyline: string;
  distance: number;
  duration: number;
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
}

interface GoogleDirectionsApiResponse {
  status: string;
  routes: Array<{
    legs: Array<{
      distance: { value: number };
      duration: { value: number };
    }>;
    bounds: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
    overview_polyline: { points: string };
  }>;
}

function isValidDirectionsResponse(
  data: unknown
): data is GoogleDirectionsApiResponse {
  if (typeof data !== "object" || data === null) return false;

  const obj = data as Record<string, unknown>;
  if (typeof obj.status !== "string") return false;
  if (!Array.isArray(obj.routes)) return false;

  return true;
}

export function useDirections({ origin, destination }: DirectionsParams) {
  const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey;

  return useQuery({
    queryKey: [
      "directions",
      origin?.lat,
      origin?.lng,
      destination?.lat,
      destination?.lng,
    ],
    queryFn: async (): Promise<DirectionsResponse> => {
      if (!origin || !destination || !apiKey) {
        throw new Error("Origin, destination, or API key missing");
      }

      logger.ride("Fetching directions", {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
      });

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=driving&key=${apiKey}`;

      const response = await fetch(url);

      if (!response.ok) {
        logger.error("Directions API failed", { status: response.status });
        throw new Error("Failed to fetch directions");
      }

      const data: unknown = await response.json();

      if (!isValidDirectionsResponse(data)) {
        logger.error("Directions API invalid response", { data });
        throw new Error("Invalid directions API response");
      }

      if (data.status !== "OK") {
        logger.error("Directions API error", { status: data.status });
        throw new Error(`Directions API error: ${data.status}`);
      }

      const route = data.routes[0];
      if (!route) {
        logger.error("Directions API no routes");
        throw new Error("No routes found");
      }

      const leg = route.legs[0];
      if (!leg) {
        logger.error("Directions API no legs");
        throw new Error("No route legs found");
      }

      logger.ride("Directions fetched successfully", {
        distance: leg.distance.value,
        duration: leg.duration.value,
        polylineLength: route.overview_polyline.points.length,
      });

      return {
        polyline: route.overview_polyline.points,
        distance: leg.distance.value,
        duration: leg.duration.value,
        bounds: route.bounds,
      };
    },
    enabled: !!origin && !!destination && !!apiKey,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
