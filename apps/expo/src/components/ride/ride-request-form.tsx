import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback, useEffect } from "react";
import { View } from "react-native";

import { DirectionsPreview } from "./directions-preview";
import { LocationAutocomplete } from "./location-autocomplete";
import { Button, ErrorCard, Spinner, Text } from "~/components/ui";
import { useDirections } from "~/hooks/useDirections";
import { useAuth } from "~/lib/hooks";
import { useLocationContext } from "~/providers/LocationProvider";
import { rideMutations } from "~/utils/api";
import { toast } from "~/utils/toast";

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface RideRequestFormProps {
  onLocationsChange?: (pickup: Location | null, dropoff: Location | null) => void;
  activeRide?: any;
  onSuggestionsChange?: (hasSuggestions: boolean) => void;
}

export function RideRequestForm({ onLocationsChange, activeRide, onSuggestionsChange }: RideRequestFormProps) {
  const { isAuthenticated } = useAuth();
  const { location } = useLocationContext();
  const queryClient = useQueryClient();

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
        value.pickupLat == null ||
        value.pickupLng == null ||
        value.dropoffLat == null ||
        value.dropoffLng == null
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
    if (!location) return;
    form.setFieldValue("pickupLat", location.latitude);
    form.setFieldValue("pickupLng", location.longitude);
  }, [location, form]);

  const requestRideMutation = useMutation({
    ...rideMutations.request(),
    onSuccess: () => {
      toast.success("Ride requested", "Finding a driver...");
      queryClient.invalidateQueries({ queryKey: ["rides", "active"] });
    },
    onError: (error) => {
      toast.error("Request failed", error.message);
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
              form={form}
              placeholder="Where to?"
              userLocation={
                location
                  ? { lat: location.latitude, lng: location.longitude }
                  : undefined
              }
              onSuggestionsChange={onSuggestionsChange}
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
          hasDropoff: state.values.dropoffLat != null && state.values.dropoffLng != null,
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
          pickupLat: state.values.pickupLat,
          pickupLng: state.values.pickupLng,
          dropoffLat: state.values.dropoffLat,
          dropoffLng: state.values.dropoffLng,
          dropoffAddress: state.values.dropoffAddress,
        })}
      >
        {({ pickupLat, pickupLng, dropoffLat, dropoffLng, dropoffAddress }) => {
          useEffect(() => {
            if (pickupLat == null || pickupLng == null) return;

            const pickup: Location = {
              lat: pickupLat,
              lng: pickupLng,
              address: "My current location",
            };

            const dropoff =
              dropoffLat != null && dropoffLng != null
                ? {
                    lat: dropoffLat,
                    lng: dropoffLng,
                    address: dropoffAddress,
                  }
                : null;

            console.log("🔄 Form values changed, updating parent:", {
              pickup: `${pickup.lat}, ${pickup.lng}`,
              dropoff: dropoff ? `${dropoff.lat}, ${dropoff.lng}` : "null",
            });

            onLocationsChange?.(pickup, dropoff);
          }, [pickupLat, pickupLng, dropoffLat, dropoffLng, dropoffAddress]);

          return null;
        }}
      </form.Subscribe>

      <form.Subscribe
        selector={(state) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
          hasDropoff: state.values.dropoffLat != null && state.values.dropoffLng != null,
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
