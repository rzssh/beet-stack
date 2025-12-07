import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import * as React from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RecentDestinations } from "~/components/main/RecentDestinations";
import { Button, Spinner, Text } from "~/components/ui";
import { usePlacesAutocomplete } from "~/hooks/usePlacesAutocomplete";
import { useLocationContext } from "~/providers/LocationProvider";
import { useMapStateStore } from "~/stores/map-state-store";
import { useRecentDestinationsStore } from "~/stores/recent-destinations-store";
import { placesQueries, rideMutations } from "~/utils/api";

interface Location {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
  name?: string;
}

interface PlaceSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText?: string;
}

export default function OrderScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ dropoff?: string }>();
  const { location } = useLocationContext();
  const queryClient = useQueryClient();
  const setMapMode = useMapStateStore((s) => s.setMode);

  const [activeInput, setActiveInput] = React.useState<"pickup" | "dropoff">("dropoff");
  const [pickupLocation, setPickupLocation] = React.useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = React.useState<Location | null>(null);
  const [pickupQuery, setPickupQuery] = React.useState("Current location");
  const [dropoffQuery, setDropoffQuery] = React.useState("");
  const [selectedPlaceId, setSelectedPlaceId] = React.useState<string | null>(null);
  const [placeTarget, setPlaceTarget] = React.useState<"pickup" | "dropoff">("dropoff");

  const pickupInputRef = React.useRef<TextInput>(null);
  const dropoffInputRef = React.useRef<TextInput>(null);

  const addDestination = useRecentDestinationsStore((s) => s.addDestination);

  const placeDetailsQuery = useQuery({
    ...placesQueries.details(selectedPlaceId ?? ""),
    enabled: !!selectedPlaceId,
  });

  const rideMutation = useMutation({
    ...rideMutations.request(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      router.replace("/(tabs)");
    },
  });

  React.useEffect(() => {
    if (placeDetailsQuery.data && selectedPlaceId) {
      const details = placeDetailsQuery.data;
      const newLocation: Location = {
        lat: details.lat,
        lng: details.lng,
        address: details.address,
        placeId: selectedPlaceId,
        name: details.name,
      };

      if (placeTarget === "pickup") {
        setPickupLocation(newLocation);
        setPickupQuery(details.address);
        setActiveInput("dropoff");
        dropoffInputRef.current?.focus();
      } else {
        setDropoffLocation(newLocation);
        setDropoffQuery(details.address);
      }

      setSelectedPlaceId(null);
    }
  }, [placeDetailsQuery.data, selectedPlaceId, placeTarget]);

  React.useEffect(() => {
    if (location && !pickupLocation) {
      setPickupLocation({
        lat: location.latitude,
        lng: location.longitude,
        address: "Current location",
      });
    }
  }, [location, pickupLocation]);

  React.useEffect(() => {
    if (params.dropoff) {
      try {
        const dest = JSON.parse(params.dropoff as string);
        setDropoffLocation(dest);
        setDropoffQuery(dest.address);
      } catch (e) {
        // ignore parse errors
      }
    }
  }, [params.dropoff]);

  const pickupAutocomplete = usePlacesAutocomplete(
    activeInput === "pickup" ? pickupQuery : "",
    location ? { lat: location.latitude, lng: location.longitude } : undefined
  );

  const dropoffAutocomplete = usePlacesAutocomplete(
    activeInput === "dropoff" ? dropoffQuery : "",
    location ? { lat: location.latitude, lng: location.longitude } : undefined
  );

  const activeSuggestions: PlaceSuggestion[] =
    activeInput === "pickup"
      ? (pickupAutocomplete.data ?? [])
      : (dropoffAutocomplete.data ?? []);

  const handleSwapLocations = () => {
    const tempPickup = pickupLocation;
    const tempPickupQuery = pickupQuery;

    setPickupLocation(dropoffLocation);
    setPickupQuery(dropoffQuery);

    setDropoffLocation(tempPickup);
    setDropoffQuery(tempPickupQuery);
  };

  const handleSuggestionSelect = (suggestion: PlaceSuggestion) => {
    setPlaceTarget(activeInput);
    setSelectedPlaceId(suggestion.placeId);

    if (activeInput === "pickup") {
      setPickupQuery(suggestion.description);
    } else {
      setDropoffQuery(suggestion.description);
    }
  };

  const handleRecentSelect = (dest: { lat: number; lng: number; address: string; placeId?: string; name?: string }) => {
    const newLocation: Location = {
      lat: dest.lat,
      lng: dest.lng,
      address: dest.address,
      placeId: dest.placeId,
      name: dest.name,
    };

    if (activeInput === "pickup") {
      setPickupQuery(dest.address);
      setPickupLocation(newLocation);
      setActiveInput("dropoff");
      dropoffInputRef.current?.focus();
    } else {
      setDropoffQuery(dest.address);
      setDropoffLocation(newLocation);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!location) return;

    const currentLocation: Location = {
      lat: location.latitude,
      lng: location.longitude,
      address: "Current location",
    };

    setPickupQuery("Current location");
    setPickupLocation(currentLocation);
    setActiveInput("dropoff");
    dropoffInputRef.current?.focus();
  };

  const handlePickupMapPin = () => {
    setMapMode("pin-pickup");
    router.back();
  };

  const handleDropoffMapPin = () => {
    setMapMode("pin-dropoff");
    router.back();
  };

  const handleConfirm = async () => {
    if (!pickupLocation || !dropoffLocation) return;
    if (pickupLocation.lat === 0 || dropoffLocation.lat === 0) return;

    if (dropoffLocation.placeId) {
      addDestination({
        address: dropoffLocation.address,
        lat: dropoffLocation.lat,
        lng: dropoffLocation.lng,
        placeId: dropoffLocation.placeId,
        name: dropoffLocation.name,
      });
    }

    await rideMutation.mutateAsync({
      pickupLat: pickupLocation.lat,
      pickupLng: pickupLocation.lng,
      pickupAddress: pickupLocation.address,
      dropoffLat: dropoffLocation.lat,
      dropoffLng: dropoffLocation.lng,
      dropoffAddress: dropoffLocation.address,
    });
  };

  const canConfirm =
    pickupLocation &&
    dropoffLocation &&
    pickupLocation.lat !== 0 &&
    dropoffLocation.lat !== 0;

  return (
    <View className="flex-1 bg-zinc-900" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-zinc-800"
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </Pressable>
        <Text className="font-semibold text-white text-lg">Plan your ride</Text>
      </View>

      <View className="flex-row gap-3 px-4">
        <View className="items-center justify-center py-3">
          <View className="h-3 w-3 rounded-full bg-green-500" />
          <View className="my-1 h-10 w-0.5 bg-zinc-700" />
          <View className="h-3 w-3 rounded-full bg-red-500" />
        </View>

        <View className="flex-1 gap-2">
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => {
                setActiveInput("pickup");
                pickupInputRef.current?.focus();
              }}
              className={`flex-1 flex-row items-center rounded-xl border-2 bg-zinc-800 px-4 py-3 ${
                activeInput === "pickup" ? "border-primary" : "border-zinc-700"
              }`}
            >
              <TextInput
                ref={pickupInputRef}
                value={pickupQuery}
                onChangeText={setPickupQuery}
                onFocus={() => setActiveInput("pickup")}
                placeholder="Pickup location"
                placeholderTextColor="#71717a"
                className="flex-1 text-white text-base"
              />
            </Pressable>
            <Pressable
              onPress={handlePickupMapPin}
              className="h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 active:bg-zinc-700"
            >
              <Ionicons name="locate" size={20} color="#a1a1aa" />
            </Pressable>
          </View>

          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => {
                setActiveInput("dropoff");
                dropoffInputRef.current?.focus();
              }}
              className={`flex-1 flex-row items-center rounded-xl border-2 bg-zinc-800 px-4 py-3 ${
                activeInput === "dropoff" ? "border-primary" : "border-zinc-700"
              }`}
            >
              <TextInput
                ref={dropoffInputRef}
                value={dropoffQuery}
                onChangeText={setDropoffQuery}
                onFocus={() => setActiveInput("dropoff")}
                placeholder="Where to?"
                placeholderTextColor="#71717a"
                className="flex-1 text-white text-base"
                autoFocus
              />
            </Pressable>
            <Pressable
              onPress={handleDropoffMapPin}
              className="h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 active:bg-zinc-700"
            >
              <Ionicons name="locate" size={20} color="#a1a1aa" />
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={handleSwapLocations}
          className="h-12 w-12 items-center justify-center self-center rounded-xl bg-zinc-800"
        >
          <Ionicons name="swap-vertical" size={20} color="#a1a1aa" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
        {activeInput === "pickup" && !pickupQuery && (
          <Pressable
            onPress={handleUseCurrentLocation}
            className="mb-2 flex-row items-center gap-3 rounded-xl bg-zinc-800 px-4 py-3 active:bg-zinc-700"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
              <Ionicons name="navigate" size={20} color="#3b82f6" />
            </View>
            <Text className="text-white">Use current location</Text>
          </Pressable>
        )}

        {activeSuggestions.length > 0 ? (
          <View className="gap-1">
            {activeSuggestions.map((suggestion) => (
              <Pressable
                key={suggestion.placeId}
                onPress={() => handleSuggestionSelect(suggestion)}
                className="flex-row items-center gap-3 rounded-xl bg-zinc-800 px-4 py-3 active:bg-zinc-700"
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-zinc-700">
                  <Ionicons name="location-outline" size={20} color="#a1a1aa" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-white">
                    {suggestion.mainText}
                  </Text>
                  {suggestion.secondaryText && (
                    <Text className="text-zinc-400 text-sm" numberOfLines={1}>
                      {suggestion.secondaryText}
                    </Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        ) : activeInput === "dropoff" && !dropoffQuery ? (
          <RecentDestinations onSelect={handleRecentSelect} />
        ) : null}
      </ScrollView>

      <View
        className="border-t border-zinc-800 px-4 pt-4"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Button
          onPress={handleConfirm}
          disabled={!canConfirm || rideMutation.isPending || placeDetailsQuery.isPending}
          className="w-full"
        >
          {rideMutation.isPending || placeDetailsQuery.isPending ? (
            <Spinner size="small" color="#fff" />
          ) : (
            <Text className="font-semibold">
              {canConfirm ? "Request Ride" : "Select locations"}
            </Text>
          )}
        </Button>
        {rideMutation.isError && (
          <Text className="text-red-400 text-center text-sm mt-2">
            {rideMutation.error.message}
          </Text>
        )}
      </View>
    </View>
  );
}
