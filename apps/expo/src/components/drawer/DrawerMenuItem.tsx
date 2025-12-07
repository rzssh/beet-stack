import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { Pressable, View } from "react-native";

import { Text } from "~/components/ui";

interface DrawerMenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  badge?: string;
}

export function DrawerMenuItem({ icon, label, onPress, badge }: DrawerMenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-4 px-5 py-4 active:bg-zinc-800"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
        <Ionicons name={icon} size={20} color="#a1a1aa" />
      </View>
      <Text className="flex-1 text-white text-base">{label}</Text>
      {badge && (
        <View className="rounded-full bg-primary px-2 py-0.5">
          <Text className="text-white text-xs">{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color="#52525b" />
    </Pressable>
  );
}
