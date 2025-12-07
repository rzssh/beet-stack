import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { Pressable, View } from "react-native";

import { Text } from "~/components/ui";

export function OtherAppsSection() {
  return (
    <View className="border-t border-zinc-800 pt-4">
      <Text className="mb-2 px-5 text-zinc-500 text-xs font-medium uppercase tracking-wide">
        Other Apps
      </Text>

      <Pressable className="flex-row items-center gap-4 px-5 py-3 active:bg-zinc-800">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-orange-500/20">
          <Ionicons name="fast-food-outline" size={20} color="#f97316" />
        </View>
        <View className="flex-1">
          <Text className="text-white">Food Delivery</Text>
          <Text className="text-zinc-500 text-xs">Coming soon</Text>
        </View>
      </Pressable>

      <Pressable className="flex-row items-center gap-4 px-5 py-3 active:bg-zinc-800">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
          <Ionicons name="car-sport-outline" size={20} color="#22c55e" />
        </View>
        <View className="flex-1">
          <Text className="text-white">Drive with us</Text>
          <Text className="text-zinc-500 text-xs">Earn money driving</Text>
        </View>
      </Pressable>
    </View>
  );
}
