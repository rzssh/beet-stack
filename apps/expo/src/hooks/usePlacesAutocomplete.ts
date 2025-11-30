import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

import { api } from "~/utils/api";
import { logger } from "~/utils/logger";

interface PlaceSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText?: string;
}

interface PlaceDetails {
  placeId: string;
  lat: number;
  lng: number;
  address: string;
  name?: string;
}

function generateSessionToken() {
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

export function usePlacesAutocomplete(
  input: string,
  userLocation?: { lat: number; lng: number },
) {
  const sessionTokenRef = useRef(generateSessionToken());

  return useQuery({
    queryKey: [
      "places-autocomplete",
      input,
      userLocation?.lat,
      userLocation?.lng,
    ],
    queryFn: async (): Promise<PlaceSuggestion[]> => {
      logger.places("Autocomplete request", { input });

      const body: Parameters<typeof api.places.autocomplete.post>[0] = {
        input,
        sessionToken: sessionTokenRef.current,
      };

      if (userLocation) {
        body.locationBias = {
          circle: {
            center: {
              latitude: userLocation.lat,
              longitude: userLocation.lng,
            },
            radius: 50000,
          },
        };
      }

      const response = await api.places.autocomplete.post(body);

      if (response.error) {
        logger.error("Places autocomplete failed", { error: response.error });
        throw new Error("Failed to fetch autocomplete suggestions");
      }

      logger.places("Autocomplete response", {
        count: response.data?.length ?? 0,
      });
      return response.data ?? [];
    },
    enabled: input.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlaceDetails(placeId: string | null) {
  return useQuery({
    queryKey: ["place-details", placeId],
    queryFn: async (): Promise<PlaceDetails> => {
      if (!placeId) {
        throw new Error("Place ID missing");
      }

      logger.places("Place details request", { placeId });

      const response = await api.places[{ id: placeId }].details.get();

      if (response.error) {
        logger.error("Place details failed", { error: response.error });
        throw new Error("Failed to fetch place details");
      }

      logger.places("Place details response", { placeId });
      return response.data;
    },
    enabled: !!placeId,
    staleTime: 60 * 60 * 1000,
  });
}
