import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { Pressable, View } from "react-native";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import { Text } from "~/components/ui";
import {
  RecentDestination,
  useRecentDestinationsStore,
} from "~/stores/recent-destinations-store";

interface RecentDestinationsProps {
  onSelect: (destination: RecentDestination) => void;
  maxItems?: number;
  animatedIndex?: SharedValue<number>;
}

export function RecentDestinations({
  onSelect,
  maxItems = 5,
  animatedIndex,
}: RecentDestinationsProps) {
  const destinations = useRecentDestinationsStore((s) => s.destinations);
  const displayedDestinations = destinations.slice(0, maxItems);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    if (!animatedIndex) return {};
    const opacity = interpolate(animatedIndex.value, [0, 0.6, 1], [0, 0, 1]);
    return { opacity };
  });

  if (displayedDestinations.length === 0) {
    return null;
  }

  return (
    <View className="gap-2">
      <Animated.View style={headerAnimatedStyle}>
        <Text className="px-1 text-zinc-500 text-xs uppercase">
          Recent destinations
        </Text>
      </Animated.View>
      <View className="gap-1">
        {displayedDestinations.map((dest, index) => {
          const itemAnimatedStyle = useAnimatedStyle(() => {
            if (!animatedIndex) return {};
            const delay = 0.1 * index;
            const opacity = interpolate(
              animatedIndex.value,
              [0, 0.5 + delay, 0.7 + delay, 1],
              [0, 0, 1, 1]
            );
            const translateY = interpolate(
              animatedIndex.value,
              [0, 0.7 + delay, 1],
              [15, 15, 0]
            );
            return {
              opacity,
              transform: [{ translateY }],
            };
          });

          return (
            <Animated.View key={dest.placeId || index} style={itemAnimatedStyle}>
              <Pressable
                onPress={() => onSelect(dest)}
                className="flex-row items-center gap-3 rounded-xl bg-zinc-800 px-4 py-3 active:bg-zinc-700"
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-zinc-700">
                  <Ionicons name="time-outline" size={20} color="#a1a1aa" />
                </View>
                <View className="flex-1">
                  {dest.name && (
                    <Text className="font-medium text-white">{dest.name}</Text>
                  )}
                  <Text
                    className={dest.name ? "text-zinc-400 text-sm" : "text-white"}
                    numberOfLines={1}
                  >
                    {dest.address}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#71717a" />
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}
