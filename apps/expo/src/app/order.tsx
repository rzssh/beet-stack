import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import * as React from "react";
import { Keyboard, Pressable, ScrollView, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RecentDestinations } from "~/components/main/RecentDestinations";
import { Button, Spinner, Text } from "~/components/ui";
import {
  usePlaceDetails,
  usePlacesAutocomplete,
} from "~/hooks/usePlacesAutocomplete";
import { useLocationContext } from "~/providers/LocationProvider";
import { useRecentDestinationsStore } from "~/stores/recent-destinations-store";
import { rideMutations } from "~/utils/api";

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

  const [activeInput, setActiveInput] = React.useState<"pickup" | "dropoff">(
    "dropoff",
  );
  const [pickupLocation, setPickupLocation] = React.useState<Location | null>(
    null,
  );
  const [dropoffLocation, setDropoffLocation] = React.useState<Location | null>(
    null,
  );
  const [pickupQuery, setPickupQuery] = React.useState("Current location");
  const [dropoffQuery, setDropoffQuery] = React.useState("");
  const [selectedPlaceId, setSelectedPlaceId] = React.useState<string | null>(
    null,
  );
  const [placeTarget, setPlaceTarget] = React.useState<"pickup" | "dropoff">(
    "dropoff",
  );

  const pickupInputRef = React.useRef<TextInput>(null);
  const dropoffInputRef = React.useRef<TextInput>(null);

  const addDestination = useRecentDestinationsStore((s) => s.addDestination);

  const placeDetailsQuery = usePlaceDetails(selectedPlaceId);

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
        setTimeout(() => dropoffInputRef.current?.focus(), 100);
      } else {
        setDropoffLocation(newLocation);
        setDropoffQuery(details.address);
        Keyboard.dismiss();
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
      } catch {
        // ignore
      }
    }
  }, [params.dropoff]);

  const pickupAutocomplete = usePlacesAutocomplete(
    activeInput === "pickup" && pickupQuery !== "Current location"
      ? pickupQuery
      : "",
    location ? { lat: location.latitude, lng: location.longitude } : undefined,
  );

  const dropoffAutocomplete = usePlacesAutocomplete(
    activeInput === "dropoff" ? dropoffQuery : "",
    location ? { lat: location.latitude, lng: location.longitude } : undefined,
  );

  const activeSuggestions: PlaceSuggestion[] =
    activeInput === "pickup"
      ? (pickupAutocomplete.data ?? [])
      : (dropoffAutocomplete.data ?? []);

  const isLoadingSuggestions =
    (activeInput === "pickup" && pickupAutocomplete.isLoading) ||
    (activeInput === "dropoff" && dropoffAutocomplete.isLoading);

  const handleSwapLocations = () => {
    const tempPickup = pickupLocation;
    const tempPickupQuery = pickupQuery;

    setPickupLocation(dropoffLocation);
    setPickupQuery(dropoffQuery || "");

    setDropoffLocation(tempPickup);
    setDropoffQuery(tempPickupQuery);
  };

  const handleSuggestionSelect = (suggestion: PlaceSuggestion) => {
    setPlaceTarget(activeInput);
    setSelectedPlaceId(suggestion.placeId);

    if (activeInput === "pickup") {
      setPickupQuery(suggestion.mainText);
    } else {
      setDropoffQuery(suggestion.mainText);
    }
  };

  const handleRecentSelect = (dest: {
    lat: number;
    lng: number;
    address: string;
    placeId?: string;
    name?: string;
  }) => {
    const newLocation: Location = {
      lat: dest.lat,
      lng: dest.lng,
      address: dest.address,
      placeId: dest.placeId,
      name: dest.name,
    };

    if (activeInput === "pickup") {
      setPickupQuery(dest.name || dest.address);
      setPickupLocation(newLocation);
      setActiveInput("dropoff");
      setTimeout(() => dropoffInputRef.current?.focus(), 100);
    } else {
      setDropoffQuery(dest.name || dest.address);
      setDropoffLocation(newLocation);
      Keyboard.dismiss();
    }
  };

  const handleUseCurrentLocation = () => {
    if (!location) return;

    setPickupQuery("Current location");
    setPickupLocation({
      lat: location.latitude,
      lng: location.longitude,
      address: "Current location",
    });
    setActiveInput("dropoff");
    setTimeout(() => dropoffInputRef.current?.focus(), 100);
  };

  const handleConfirm = async () => {
    if (!pickupLocation || !dropoffLocation) return;

    if (dropoffLocation.placeId && dropoffLocation.lat !== 0) {
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
    dropoffLocation.lat !== 0 &&
    !placeDetailsQuery.isPending;

  const isProcessing = rideMutation.isPending || placeDetailsQuery.isPending;

  return (
    <View style={{ flex: 1, backgroundColor: "#18181b" }}>
      <View
        style={{
          paddingTop: insets.top,
          backgroundColor: "#18181b",
          borderBottomWidth: 1,
          borderBottomColor: "#27272a",
        }}
      >
        <View className="flex-row items-center gap-3 px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-zinc-800 active:bg-zinc-700"
          >
            <Ionicons name="close" size={22} color="#fff" />
          </Pressable>
          <Text className="font-semibold text-lg text-white">
            Plan your ride
          </Text>
        </View>

        <View className="flex-row px-4 pb-4">
          <View className="mr-3 items-center justify-center">
            <View className="h-3 w-3 rounded-full bg-green-500" />
            <View className="my-1.5 h-8 w-0.5 bg-zinc-600" />
            <View className="h-3 w-3 rounded-full bg-primary" />
          </View>

          <View className="flex-1 gap-2">
            <Pressable
              onPress={() => {
                setActiveInput("pickup");
                if (pickupQuery === "Current location") {
                  setPickupQuery("");
                }
                pickupInputRef.current?.focus();
              }}
              className={`flex-row items-center rounded-xl bg-zinc-800 px-4 py-3 ${
                activeInput === "pickup" ? "border-2 border-green-500" : ""
              }`}
            >
              <TextInput
                ref={pickupInputRef}
                value={pickupQuery}
                onChangeText={(text) => {
                  setPickupQuery(text);
                  if (text !== pickupLocation?.address) {
                    setPickupLocation(null);
                  }
                }}
                onFocus={() => {
                  setActiveInput("pickup");
                  if (pickupQuery === "Current location") {
                    setPickupQuery("");
                  }
                }}
                placeholder="Pickup location"
                placeholderTextColor="#71717a"
                className="flex-1 text-white"
                style={{ fontSize: 16 }}
              />
              {activeInput === "pickup" && pickupQuery.length > 0 && (
                <Pressable onPress={() => setPickupQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#71717a" />
                </Pressable>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setActiveInput("dropoff");
                dropoffInputRef.current?.focus();
              }}
              className={`flex-row items-center rounded-xl bg-zinc-800 px-4 py-3 ${
                activeInput === "dropoff" ? "border-2 border-primary" : ""
              }`}
            >
              <TextInput
                ref={dropoffInputRef}
                value={dropoffQuery}
                onChangeText={(text) => {
                  setDropoffQuery(text);
                  if (text !== dropoffLocation?.address) {
                    setDropoffLocation(null);
                  }
                }}
                onFocus={() => setActiveInput("dropoff")}
                placeholder="Where to?"
                placeholderTextColor="#71717a"
                className="flex-1 text-white"
                style={{ fontSize: 16 }}
                autoFocus
              />
              {activeInput === "dropoff" && dropoffQuery.length > 0 && (
                <Pressable onPress={() => setDropoffQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#71717a" />
                </Pressable>
              )}
            </Pressable>
          </View>

          <Pressable
            onPress={handleSwapLocations}
            className="ml-3 h-10 w-10 items-center justify-center self-center rounded-full bg-zinc-800 active:bg-zinc-700"
          >
            <Ionicons name="swap-vertical" size={20} color="#a1a1aa" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {activeInput === "pickup" && pickupQuery.length === 0 && (
          <Pressable
            onPress={handleUseCurrentLocation}
            className="mb-3 flex-row items-center gap-3 rounded-xl bg-zinc-800 px-4 py-3 active:bg-zinc-700"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
              <Ionicons name="navigate" size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="font-medium text-white">Current location</Text>
              <Text className="text-sm text-zinc-400">Use GPS location</Text>
            </View>
          </Pressable>
        )}

        {isLoadingSuggestions && (
          <View className="items-center py-8">
            <Spinner size="small" />
          </View>
        )}

        {!isLoadingSuggestions && activeSuggestions.length > 0 && (
          <Animated.View entering={FadeIn.duration(200)} className="gap-1">
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
                    <Text className="text-sm text-zinc-400" numberOfLines={1}>
                      {suggestion.secondaryText}
                    </Text>
                  )}
                </View>
              </Pressable>
            ))}
          </Animated.View>
        )}

        {!isLoadingSuggestions &&
          activeSuggestions.length === 0 &&
          activeInput === "dropoff" &&
          dropoffQuery.length < 2 && (
            <RecentDestinations onSelect={handleRecentSelect} />
          )}
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom + 16,
          paddingTop: 16,
          paddingHorizontal: 16,
          backgroundColor: "#18181b",
          borderTopWidth: 1,
          borderTopColor: "#27272a",
        }}
      >
        <Button
          onPress={handleConfirm}
          disabled={!canConfirm || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <Spinner size="small" color="#fff" />
          ) : (
            <Text className="font-semibold text-white">
              {canConfirm ? "Request Ride" : "Select locations"}
            </Text>
          )}
        </Button>
        {rideMutation.isError && (
          <Text className="mt-2 text-center text-red-400 text-sm">
            {rideMutation.error.message}
          </Text>
        )}
      </View>
    </View>
  );
}
