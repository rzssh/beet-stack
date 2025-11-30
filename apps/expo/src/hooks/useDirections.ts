import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";

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

export function useDirections({ origin, destination }: DirectionsParams) {
  const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey;

  return useQuery({
    queryKey: ["directions", origin, destination],
    queryFn: async (): Promise<DirectionsResponse> => {
      if (!origin || !destination || !apiKey) {
        throw new Error("Origin, destination, or API key missing");
      }

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=driving&key=${apiKey}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch directions");
      }

      const data = await response.json();

      if (data.status !== "OK" || !data.routes?.[0]) {
        throw new Error(`Directions API error: ${data.status}`);
      }

      const route = data.routes[0];
      const leg = route.legs[0];

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
