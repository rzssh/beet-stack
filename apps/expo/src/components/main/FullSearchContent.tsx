import { Ionicons } from "@expo/vector-icons";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import * as React from "react";
import { Pressable, View } from "react-native";

import { Text } from "~/components/ui";
import { usePlacesAutocomplete } from "~/hooks/usePlacesAutocomplete";
import { useLocationContext } from "~/providers/LocationProvider";
import { RecentDestination } from "~/stores/recent-destinations-store";

import { RecentDestinations } from "./RecentDestinations";

interface Location {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
  name?: string;
}

interface FullSearchContentProps {
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  onPickupChange: (location: Location | null) => void;
  onDropoffChange: (location: Location | null) => void;
  onBack: () => void;
  onMapPinMode: (type: "pickup" | "dropoff") => void;
  activeInput: "pickup" | "dropoff";
  onActiveInputChange: (input: "pickup" | "dropoff") => void;
}

interface PlaceSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText?: string;
}

export function FullSearchContent({
  pickupLocation,
  dropoffLocation,
  onPickupChange,
  onDropoffChange,
  onBack,
  onMapPinMode,
  activeInput,
  onActiveInputChange,
}: FullSearchContentProps) {
  const { location } = useLocationContext();
  const [pickupQuery, setPickupQuery] = React.useState(
    pickupLocation?.address ?? ""
  );
  const [dropoffQuery, setDropoffQuery] = React.useState(
    dropoffLocation?.address ?? ""
  );

  const pickupAutocomplete = usePlacesAutocomplete(
    activeInput === "pickup" ? pickupQuery : "",
    location
      ? { lat: location.latitude, lng: location.longitude }
      : undefined
  );

  const dropoffAutocomplete = usePlacesAutocomplete(
    activeInput === "dropoff" ? dropoffQuery : "",
    location
      ? { lat: location.latitude, lng: location.longitude }
      : undefined
  );

  const activeSuggestions =
    activeInput === "pickup"
      ? (pickupAutocomplete.data ?? [])
      : (dropoffAutocomplete.data ?? []);

  const handleSwapLocations = () => {
    const tempPickup = pickupLocation;
    const tempPickupQuery = pickupQuery;

    onPickupChange(dropoffLocation);
    setPickupQuery(dropoffQuery);

    onDropoffChange(tempPickup);
    setDropoffQuery(tempPickupQuery);
  };

  const handleSuggestionSelect = async (suggestion: PlaceSuggestion) => {
    const newLocation: Location = {
      lat: 0,
      lng: 0,
      address: suggestion.description,
      placeId: suggestion.placeId,
      name: suggestion.mainText,
    };

    if (activeInput === "pickup") {
      setPickupQuery(suggestion.description);
      onPickupChange(newLocation);
      onActiveInputChange("dropoff");
    } else {
      setDropoffQuery(suggestion.description);
      onDropoffChange(newLocation);
    }
  };

  const handleRecentSelect = (dest: RecentDestination) => {
    const newLocation: Location = {
      lat: dest.lat,
      lng: dest.lng,
      address: dest.address,
      placeId: dest.placeId,
      name: dest.name,
    };

    if (activeInput === "pickup") {
      setPickupQuery(dest.address);
      onPickupChange(newLocation);
      onActiveInputChange("dropoff");
    } else {
      setDropoffQuery(dest.address);
      onDropoffChange(newLocation);
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
    onPickupChange(currentLocation);
    onActiveInputChange("dropoff");
  };

  return (
    <View className="flex-1 gap-4">
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={onBack}
          className="h-10 w-10 items-center justify-center rounded-full bg-zinc-800"
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </Pressable>
        <Text className="font-semibold text-white text-lg">
          Plan your ride
        </Text>
      </View>

      <View className="flex-row gap-3">
        <View className="items-center justify-center py-3">
          <View className="h-3 w-3 rounded-full bg-green-500" />
          <View className="my-1 h-8 w-0.5 bg-zinc-600" />
          <View className="h-3 w-3 rounded-full bg-red-500" />
        </View>

        <View className="flex-1 gap-2">
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => onActiveInputChange("pickup")}
              className={`flex-1 flex-row items-center rounded-xl border-2 bg-zinc-800 px-4 py-3 ${
                activeInput === "pickup" ? "border-primary" : "border-zinc-700"
              }`}
            >
              <BottomSheetTextInput
                value={pickupQuery}
                onChangeText={setPickupQuery}
                onFocus={() => onActiveInputChange("pickup")}
                placeholder="Pickup location"
                placeholderTextColor="#71717a"
                style={{ flex: 1, color: "#fff", fontSize: 16 }}
              />
            </Pressable>
            <Pressable
              onPress={() => onMapPinMode("pickup")}
              className="h-12 w-12 items-center justify-center rounded-xl bg-zinc-800"
            >
              <Ionicons name="locate" size={20} color="#a1a1aa" />
            </Pressable>
          </View>

          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => onActiveInputChange("dropoff")}
              className={`flex-1 flex-row items-center rounded-xl border-2 bg-zinc-800 px-4 py-3 ${
                activeInput === "dropoff" ? "border-primary" : "border-zinc-700"
              }`}
            >
              <BottomSheetTextInput
                value={dropoffQuery}
                onChangeText={setDropoffQuery}
                onFocus={() => onActiveInputChange("dropoff")}
                placeholder="Where to?"
                placeholderTextColor="#71717a"
                style={{ flex: 1, color: "#fff", fontSize: 16 }}
              />
            </Pressable>
            <Pressable
              onPress={() => onMapPinMode("dropoff")}
              className="h-12 w-12 items-center justify-center rounded-xl bg-zinc-800"
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

      {activeInput === "pickup" && !pickupQuery && (
        <Pressable
          onPress={handleUseCurrentLocation}
          className="flex-row items-center gap-3 rounded-xl bg-zinc-800 px-4 py-3 active:bg-zinc-700"
        >
          <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
            <Ionicons name="navigate" size={20} color="#3b82f6" />
          </View>
          <Text className="text-white">Use current location</Text>
        </Pressable>
      )}

      {activeSuggestions.length > 0 ? (
        <View className="gap-1">
          {(activeSuggestions as PlaceSuggestion[]).map((suggestion) => (
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
    </View>
  );
}
