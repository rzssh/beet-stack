import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import * as React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Spinner,
  Text,
} from "~/components/ui";
import { useAuth } from "~/lib/hooks";
import { driverQueries } from "~/utils/api";
import { authClient } from "~/utils/auth";

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
}

const accountMenuItems: MenuItem[] = [
  { icon: "person-outline", label: "Personal Data", route: "/(tabs)/profile/personal-data" },
  { icon: "location-outline", label: "Saved Addresses", route: "/(tabs)/profile/saved-addresses" },
  { icon: "card-outline", label: "Payment Methods", route: "/(tabs)/profile/billing" },
  { icon: "shield-outline", label: "Security", route: "/(tabs)/profile/security" },
];

export default function ProfileScreen() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const { isAuthenticated } = useAuth();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const driverProfileQuery = useQuery({
    ...driverQueries.profile(),
    enabled: isAuthenticated,
  });

  const hasDriverProfile = !!driverProfileQuery.data;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      router.replace("/");
    } finally {
      setIsSigningOut(false);
    }
  };

  if (sessionLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-zinc-950">
        <Spinner label="Loading..." />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950">
        <View className="flex-1 items-center justify-center gap-6 px-6">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-zinc-800">
            <Ionicons name="person-outline" size={48} color="#a1a1aa" />
          </View>
          <View className="items-center gap-2">
            <Text className="font-semibold text-2xl text-white">Welcome</Text>
            <Text className="text-center text-zinc-400">
              Sign in to access your profile and settings
            </Text>
          </View>
          <View className="w-full gap-3">
            <Button onPress={() => router.push("/(auth)/login")}>
              <Text>Sign In</Text>
            </Button>
            <Button
              variant="outline"
              onPress={() => router.push("/(auth)/signup")}
            >
              <Text>Create Account</Text>
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const user = session?.user;

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, padding: 16, gap: 24, paddingBottom: 32 }}
      >
        <View className="items-center gap-4 py-4">
          <Avatar alt={user?.name ?? "User"} className="h-24 w-24">
            {user?.image ? (
              <AvatarImage source={{ uri: user.image }} />
            ) : (
              <AvatarFallback className="bg-primary">
                <Text className="font-bold text-3xl text-white">
                  {user?.name?.[0]?.toUpperCase() ?? "?"}
                </Text>
              </AvatarFallback>
            )}
          </Avatar>
          <View className="items-center gap-1">
            <Text className="font-semibold text-white text-2xl">
              {user?.name ?? "User"}
            </Text>
            <Text className="text-zinc-400">{user?.email}</Text>
          </View>
          <Button
            variant="outline"
            size="sm"
            onPress={() => router.push("/(tabs)/profile/personal-data")}
          >
            <Ionicons name="pencil" size={16} color="#fff" />
            <Text className="ml-2">Edit Profile</Text>
          </Button>
        </View>

        <View className="gap-3">
          <Text className="px-1 text-zinc-500 text-xs font-medium uppercase">
            Account
          </Text>
          <View className="overflow-hidden rounded-2xl bg-zinc-800">
            {accountMenuItems.map((item, index) => (
              <Pressable
                key={item.route}
                onPress={() => router.push(item.route as never)}
                className={`flex-row items-center gap-4 px-4 py-4 active:bg-zinc-700 ${
                  index < accountMenuItems.length - 1 ? "border-b border-zinc-700" : ""
                }`}
              >
                <Ionicons name={item.icon} size={22} color="#a1a1aa" />
                <Text className="flex-1 text-white">{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color="#71717a" />
              </Pressable>
            ))}
          </View>
        </View>

        <View className="gap-3">
          <Text className="px-1 text-zinc-500 text-xs font-medium uppercase">
            Driver
          </Text>
          {driverProfileQuery.isLoading ? (
            <View className="items-center rounded-2xl bg-zinc-800 p-5">
              <Spinner size="small" />
            </View>
          ) : driverProfileQuery.error ? (
            <View className="rounded-2xl bg-red-900/20 border border-red-700 p-4">
              <Text className="text-red-400 text-center">Failed to load driver status</Text>
            </View>
          ) : hasDriverProfile ? (
            <View className="rounded-2xl bg-zinc-800 p-5">
              <View className="flex-row items-center gap-4">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-green-500/20">
                  <Ionicons name="car" size={28} color="#22c55e" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-white text-lg">
                    Driver Account Active
                  </Text>
                  <Text className="text-zinc-400">
                    {driverProfileQuery.data?.vehicleMake}{" "}
                    {driverProfileQuery.data?.vehicleModel} •{" "}
                    {driverProfileQuery.data?.vehicleColor}
                  </Text>
                </View>
              </View>
              <View className="mt-4 flex-row items-center justify-between border-t border-zinc-700 pt-4">
                <Text className="text-zinc-400">Status</Text>
                <View
                  className={`rounded-full px-3 py-1.5 ${
                    driverProfileQuery.data?.isOnline
                      ? "bg-green-500"
                      : "bg-zinc-600"
                  }`}
                >
                  <Text className="font-medium text-white text-sm">
                    {driverProfileQuery.data?.isOnline ? "Online" : "Offline"}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => router.push("/(tabs)/profile/driver-registration")}
              className="flex-row items-center gap-4 rounded-2xl bg-zinc-800 p-5 active:bg-zinc-700"
            >
              <View className="h-14 w-14 items-center justify-center rounded-full bg-primary/20">
                <Ionicons name="car-outline" size={28} color="#c03484" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-white text-lg">
                  Become a Driver
                </Text>
                <Text className="text-zinc-400">
                  Earn money on your own schedule
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#71717a" />
            </Pressable>
          )}
        </View>

        <View className="mt-auto">
          <Pressable
            onPress={handleSignOut}
            disabled={isSigningOut}
            className="flex-row items-center justify-center gap-3 rounded-2xl bg-zinc-800 py-4 active:bg-zinc-700"
          >
            {isSigningOut ? (
              <Spinner size="small" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                <Text className="font-medium text-red-500">Sign Out</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
