import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import type { FieldApi } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, useColorScheme, View } from "react-native";

import { Spinner, Text } from "~/components/ui";
import {
  usePlaceDetails,
  usePlacesAutocomplete,
} from "~/hooks/usePlacesAutocomplete";

interface LocationAutocompleteProps {
  field: FieldApi<any, any, any, any, string>;
  placeholder: string;
  onLocationSelected: (location: {
    placeId: string;
    lat: number;
    lng: number;
    address: string;
  }) => void;
  userLocation?: { lat: number; lng: number };
}

export function LocationAutocomplete({
  field,
  placeholder,
  onLocationSelected,
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
    setIsFocused(false);
    field.handleBlur();
  };

  const handleSelectSuggestion = (placeId: string, description: string) => {
    field.handleChange(description);
    setSelectedPlaceId(placeId);
    setIsFocused(false);
  };

  useEffect(() => {
    if (placeDetailsQuery.data && selectedPlaceId) {
      field.handleChange(placeDetailsQuery.data.address);
      onLocationSelected(placeDetailsQuery.data);
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
        <ScrollView
          className="mt-2"
          style={{ maxHeight: 300 }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {suggestionsQuery.data.map((item) => (
            <Pressable
              key={item.placeId}
              onPress={() =>
                handleSelectSuggestion(item.placeId, item.description)
              }
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
        </ScrollView>
      )}

      {showSuggestions && suggestionsQuery.data.length === 0 && (
        <View className="mt-2 px-4 py-3">
          <Text className="text-zinc-500 text-sm">No results found</Text>
        </View>
      )}
    </View>
  );
}
