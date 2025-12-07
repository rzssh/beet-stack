import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as React from "react";
import { Pressable, View } from "react-native";

import { Text } from "~/components/ui";
import { useAuth } from "~/lib/hooks";
import { useDrawerStore } from "~/stores/drawer-store";

export function DrawerHeader() {
  const { session, isAuthenticated } = useAuth();
  const close = useDrawerStore((s) => s.close);

  const handleViewProfile = () => {
    close();
    router.push("/(tabs)/profile");
  };

  const handleSignIn = () => {
    close();
    router.push("/(auth)/login");
  };

  if (!isAuthenticated) {
    return (
      <View className="border-b border-zinc-800 px-5 py-6">
        <Pressable
          onPress={handleSignIn}
          className="flex-row items-center gap-3"
        >
          <View className="h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
            <Ionicons name="person-outline" size={28} color="#a1a1aa" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-white text-lg">Sign In</Text>
            <Text className="text-zinc-400 text-sm">
              Access your account
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#52525b" />
        </Pressable>
      </View>
    );
  }

  const userName = session?.user?.name ?? "User";
  const userInitial = userName[0]?.toUpperCase() ?? "?";

  return (
    <View className="border-b border-zinc-800 px-5 py-6">
      <Pressable
        onPress={handleViewProfile}
        className="flex-row items-center gap-3"
      >
        <View className="h-16 w-16 items-center justify-center rounded-full bg-primary">
          <Text className="font-bold text-2xl text-white">{userInitial}</Text>
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-white text-lg">{userName}</Text>
          <View className="flex-row items-center gap-2">
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text className="text-zinc-400 text-sm">4.95</Text>
            <Text className="text-zinc-600">·</Text>
            <Text className="text-primary text-sm">View profile</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#52525b" />
      </Pressable>
    </View>
  );
}
