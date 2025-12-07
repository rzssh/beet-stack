import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { Pressable, View } from "react-native";

import { Text } from "~/components/ui";

interface CollapsedContentProps {
  onInputPress: () => void;
}

export function CollapsedContent({ onInputPress }: CollapsedContentProps) {
  return (
    <View className="gap-4">
      <Pressable
        onPress={onInputPress}
        className="flex-row items-center gap-3 rounded-xl bg-zinc-800 px-4 py-4 active:bg-zinc-700"
      >
        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/20">
          <Ionicons name="search" size={20} color="#c03484" />
        </View>
        <Text className="flex-1 text-zinc-400 text-lg">Where to?</Text>
        <Ionicons name="chevron-forward" size={20} color="#71717a" />
      </Pressable>
    </View>
  );
}
