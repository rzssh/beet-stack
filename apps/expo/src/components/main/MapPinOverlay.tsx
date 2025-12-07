import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { View } from "react-native";

import { Button, Spinner, Text } from "~/components/ui";

interface MapPinOverlayProps {
  type: "pickup" | "dropoff";
  address: string | null;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MapPinOverlay({
  type,
  address,
  isLoading,
  onConfirm,
  onCancel,
}: MapPinOverlayProps) {
  return (
    <>
      <View className="absolute top-1/2 left-1/2 z-30 -ml-6 -mt-12">
        <View className="items-center">
          <Ionicons
            name="location"
            size={48}
            color={type === "pickup" ? "#22c55e" : "#ef4444"}
          />
        </View>
      </View>

      <View className="absolute right-4 bottom-32 left-4 z-30">
        <View className="rounded-xl border border-zinc-700 bg-zinc-800 p-4">
          <View className="mb-4 flex-row items-center gap-3">
            <View
              className={`h-10 w-10 items-center justify-center rounded-full ${
                type === "pickup" ? "bg-green-500/20" : "bg-red-500/20"
              }`}
            >
              <Ionicons
                name="location"
                size={20}
                color={type === "pickup" ? "#22c55e" : "#ef4444"}
              />
            </View>
            <View className="flex-1">
              <Text className="text-zinc-400 text-sm">
                {type === "pickup" ? "Pickup location" : "Drop-off location"}
              </Text>
              {isLoading ? (
                <View className="flex-row items-center gap-2">
                  <Spinner size="small" />
                  <Text className="text-zinc-400">Finding address...</Text>
                </View>
              ) : (
                <Text className="text-white" numberOfLines={2}>
                  {address ?? "Move map to select location"}
                </Text>
              )}
            </View>
          </View>

          <View className="flex-row gap-3">
            <Button
              variant="outline"
              onPress={onCancel}
              className="flex-1 border-zinc-600"
            >
              <Text className="text-zinc-300">Cancel</Text>
            </Button>
            <Button
              onPress={onConfirm}
              disabled={!address || isLoading}
              className="flex-1"
            >
              <Text>Confirm</Text>
            </Button>
          </View>
        </View>
      </View>
    </>
  );
}
