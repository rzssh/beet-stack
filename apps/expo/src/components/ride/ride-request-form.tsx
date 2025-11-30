import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { DirectionsPreview } from "./directions-preview";
import { LocationAutocomplete } from "./location-autocomplete";
import { RideSearchingState } from "./ride-searching-state";
import { Button, ErrorCard, Spinner, Text } from "~/components/ui";
import { useDirections } from "~/hooks/useDirections";
import { useAuth } from "~/lib/hooks";
import { useLocationContext } from "~/providers/LocationProvider";
import { rideMutations } from "~/utils/api";
import { logger } from "~/utils/logger";
import { toast } from "~/utils/toast";

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface RideRequestFormProps {
  onLocationsChange?: (pickup: Location | null, dropoff: Location | null) => void;
  activeRide?: any;
}

export function RideRequestForm({ onLocationsChange, activeRide }: RideRequestFormProps) {
  const { isAuthenticated } = useAuth();
  const { location } = useLocationContext();
  const [isSearching, setIsSearching] = useState(false);
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);

  const form = useForm({
    defaultValues: {
      pickupAddress: "My current location",
      pickupLat: location?.latitude ?? null,
      pickupLng: location?.longitude ?? null,
      dropoffAddress: "",
      dropoffLat: null as number | null,
      dropoffLng: null as number | null,
      dropoffPlaceId: null as string | null,
    },
    onSubmit: async ({ value }) => {
      if (!isAuthenticated) {
        router.push("/(auth)/login");
        return;
      }

      if (
        !value.pickupLat ||
        !value.pickupLng ||
        !value.dropoffLat ||
        !value.dropoffLng
      ) {
        return;
      }

      await requestRideMutation.mutateAsync({
        pickupLat: value.pickupLat,
        pickupLng: value.pickupLng,
        pickupAddress: value.pickupAddress,
        dropoffLat: value.dropoffLat,
        dropoffLng: value.dropoffLng,
        dropoffAddress: value.dropoffAddress,
      });
    },
  });

  useEffect(() => {
    if (location) {
      form.setFieldValue("pickupLat", location.latitude);
      form.setFieldValue("pickupLng", location.longitude);

      const pickup: Location = {
        lat: location.latitude,
        lng: location.longitude,
        address: "My current location",
      };
      const dropoff =
        form.state.values.dropoffLat && form.state.values.dropoffLng
          ? {
              lat: form.state.values.dropoffLat,
              lng: form.state.values.dropoffLng,
              address: form.state.values.dropoffAddress,
            }
          : null;

      onLocationsChange?.(pickup, dropoff);
    }
  }, [location, form.state.values.dropoffLat, form.state.values.dropoffLng]);

  useEffect(() => {
    if (isSearching && activeRide) {
      const status = activeRide.status;
      if (status === "accepted" || status === "driver_arrived") {
        setIsSearching(false);
        setSearchStartTime(null);
      }
    }
  }, [activeRide?.status, isSearching]);

  const requestRideMutation = useMutation({
    ...rideMutations.request(),
    onSuccess: () => {
      logger.ride("Ride requested successfully");
      toast.success("Ride requested", "Finding a driver...");
      setIsSearching(true);
      setSearchStartTime(Date.now());
    },
    onError: (error) => {
      logger.error("Failed to request ride", { error: error.message });
      toast.error("Request failed", error.message);
    },
  });

  const cancelRideMutation = useMutation({
    ...rideMutations.cancel(),
    onSuccess: () => {
      logger.ride("Ride cancelled");
      toast.info("Ride cancelled");
      setIsSearching(false);
      setSearchStartTime(null);
      form.reset();
      onLocationsChange?.(null, null);
    },
    onError: (error) => {
      logger.error("Failed to cancel ride", { error: error.message });
      toast.error("Cancel failed", error.message);
    },
  });

  const directionsQuery = useDirections({
    origin:
      form.state.values.pickupLat && form.state.values.pickupLng
        ? {
            lat: form.state.values.pickupLat,
            lng: form.state.values.pickupLng,
          }
        : null,
    destination:
      form.state.values.dropoffLat && form.state.values.dropoffLng
        ? {
            lat: form.state.values.dropoffLat,
            lng: form.state.values.dropoffLng,
          }
        : null,
  });

  if (!isAuthenticated) {
    return (
      <View className="gap-4">
        <Text variant="h3" className="text-white">
          Request a Ride
        </Text>
        <View className="rounded-xl border-zinc-700 bg-zinc-800 border p-4">
          <Text className="text-center text-white mb-3">
            Sign in to request rides
          </Text>
          <Button onPress={() => router.push("/(auth)/login")}>
            <Text>Sign In</Text>
          </Button>
        </View>
      </View>
    );
  }

  if (isSearching && searchStartTime) {
    return (
      <RideSearchingState
        searchStartTime={searchStartTime}
        onCancel={() => {
          if (activeRide?.id) {
            cancelRideMutation.mutate({
              rideId: activeRide.id,
              reason: "User canceled",
            });
          }
        }}
        isCanceling={cancelRideMutation.isPending}
      />
    );
  }

  return (
    <View className="gap-4">
      <Text variant="h3" className="text-white">
        Request a Ride
      </Text>

      <View>
        <Text className="mb-2 text-sm text-zinc-400">Pickup Location</Text>
        <View className="rounded-xl bg-zinc-800 px-4 py-4 border-2 border-transparent opacity-75">
          <Text className="text-white">📍 My current location</Text>
          <Text className="text-xs text-zinc-500 mt-1">
            Uses your current GPS location
          </Text>
        </View>
      </View>

      <form.Field
        name="dropoffAddress"
        listeners={{
          onChangeListenTo: "change",
          onChangeDebounceMs: 300,
        }}
      >
        {(field) => (
          <View>
            <Text className="mb-2 text-sm text-zinc-400">
              Dropoff Location
            </Text>
            <LocationAutocomplete
              field={field}
              placeholder="Where to?"
              onLocationSelected={(loc) => {
                form.setFieldValue("dropoffLat", loc.lat);
                form.setFieldValue("dropoffLng", loc.lng);
                form.setFieldValue("dropoffAddress", loc.address);
                form.setFieldValue("dropoffPlaceId", loc.placeId);
              }}
              userLocation={
                location
                  ? { lat: location.latitude, lng: location.longitude }
                  : undefined
              }
            />
          </View>
        )}
      </form.Field>

      {directionsQuery.error && (
        <ErrorCard
          message={directionsQuery.error.message}
          action={{
            label: "Retry",
            onPress: () => directionsQuery.refetch(),
          }}
          onDismiss={() => directionsQuery.refetch()}
        />
      )}

      <form.Subscribe
        selector={(state) => ({
          hasDropoff: !!state.values.dropoffLat && !!state.values.dropoffLng,
        })}
      >
        {({ hasDropoff }) =>
          hasDropoff && !directionsQuery.error ? (
            <DirectionsPreview
              distance={directionsQuery.data?.distance ?? 0}
              duration={directionsQuery.data?.duration ?? 0}
              isLoading={directionsQuery.isLoading}
              error={directionsQuery.error?.message}
            />
          ) : null
        }
      </form.Subscribe>

      <form.Subscribe
        selector={(state) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
          hasDropoff: !!state.values.dropoffLat && !!state.values.dropoffLng,
        })}
      >
        {({ canSubmit, isSubmitting, hasDropoff }) => (
          <Button
            onPress={form.handleSubmit}
            disabled={!canSubmit || !hasDropoff || isSubmitting}
          >
            {isSubmitting ? (
              <Spinner size="small" color="white" />
            ) : (
              <Text>Request Ride</Text>
            )}
          </Button>
        )}
      </form.Subscribe>
    </View>
  );
}
