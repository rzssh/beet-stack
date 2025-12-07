import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useEffect, useState } from "react";
import { Pressable, useColorScheme, View } from "react-native";

import { Spinner, Text } from "~/components/ui";
import {
  usePlaceDetails,
  usePlacesAutocomplete,
} from "~/hooks/usePlacesAutocomplete";

interface StringFieldApi {
  state: {
    value: string;
  };
  handleChange: (value: string) => void;
  handleBlur: () => void;
}

interface RideFormValues {
  dropoffAddress: string;
  dropoffLat: number | null;
  dropoffLng: number | null;
  dropoffPlaceId: string | null;
}

interface RideFormApi {
  setFieldValue: {
    (name: "dropoffAddress", value: string): void;
    (name: "dropoffLat", value: number): void;
    (name: "dropoffLng", value: number): void;
    (name: "dropoffPlaceId", value: string): void;
  };
  state: {
    values: RideFormValues;
  };
}

interface LocationAutocompleteProps {
  field: StringFieldApi;
  form: RideFormApi;
  placeholder: string;
  userLocation?: { lat: number; lng: number };
}

export function LocationAutocomplete({
  field,
  form,
  placeholder,
  userLocation,
}: LocationAutocompleteProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const suggestionsQuery = usePlacesAutocomplete(field.state.value, userLocation);
  const placeDetailsQuery = usePlaceDetails(selectedPlaceId);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    field.handleBlur();
  };

  const handleSelectSuggestion = (placeId: string, description: string) => {
    setSelectedPlaceId(placeId);
    setIsFocused(false);
  };

  useEffect(() => {
    if (placeDetailsQuery.data && selectedPlaceId) {
      const address = placeDetailsQuery.data.address;
      const lat = placeDetailsQuery.data.lat;
      const lng = placeDetailsQuery.data.lng;
      const placeId = placeDetailsQuery.data.placeId;

      console.log("✅ Setting form values:", { address, lat, lng, placeId });

      form.setFieldValue("dropoffAddress", address);
      form.setFieldValue("dropoffLat", lat);
      form.setFieldValue("dropoffLng", lng);
      form.setFieldValue("dropoffPlaceId", placeId);

      console.log("✅ Form values after set:", {
        dropoffAddress: form.state.values.dropoffAddress,
        dropoffLat: form.state.values.dropoffLat,
        dropoffLng: form.state.values.dropoffLng,
      });

      setSelectedPlaceId(null);
    }
  }, [placeDetailsQuery.data, selectedPlaceId]);

  const showSuggestions =
    isFocused && field.state.value.length >= 2 && suggestionsQuery.data;

  return (
    <View className="w-full">
      <BottomSheetTextInput
        style={{
          backgroundColor: isDark ? "#27272a" : "#f4f4f5",
          borderRadius: 12,
          paddingHorizontal: 20,
          paddingVertical: 16,
          color: isDark ? "#fff" : "#09090b",
          fontSize: 16,
          borderWidth: 2,
          borderColor: isFocused
            ? isDark
              ? "#52525b"
              : "#e4e4e7"
            : "transparent",
        }}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
        value={field.state.value}
        onChangeText={field.handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      {suggestionsQuery.isLoading && field.state.value.length >= 2 && (
        <View className="mt-2 flex-row items-center gap-2 px-2">
          <Spinner size="small" color="#71717a" />
          <Text className="text-muted-foreground text-sm">Searching...</Text>
        </View>
      )}

      {showSuggestions && suggestionsQuery.data.length > 0 && (
        <View className="mt-2">
          {suggestionsQuery.data.slice(0, 5).map((item) => (
            <Pressable
              key={item.placeId}
              onPress={() => handleSelectSuggestion(item.placeId, item.description)}
              className="border-zinc-800 border-b px-4 py-3 active:bg-zinc-800"
            >
              <Text className="font-semibold text-white">{item.mainText}</Text>
              {item.secondaryText && (
                <Text className="text-muted-foreground text-sm">
                  {item.secondaryText}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      )}

      {showSuggestions && suggestionsQuery.data.length === 0 && (
        <View className="mt-2 px-4 py-3">
          <Text className="text-zinc-500 text-sm">No results found</Text>
        </View>
      )}
    </View>
  );
}
