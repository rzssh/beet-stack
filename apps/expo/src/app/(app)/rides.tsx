import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import * as React from "react";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Spinner, Text } from "~/components/ui";

interface Ride {
  id: string;
  status: string;
  pickupAddress: string;
  dropoffAddress: string;
  finalPrice: number | null;
  estimatedPrice: number | null;
  completedAt: string | null;
  requestedAt: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RideHistoryCard({ ride }: { ride: Ride }) {
  const price = ride.finalPrice ?? ride.estimatedPrice;
  const date = ride.completedAt ?? ride.requestedAt;

  return (
    <View className="rounded-xl border border-zinc-700 bg-zinc-800 p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm text-zinc-400">{formatDate(date)}</Text>
        <View
          className={`rounded-full px-2 py-1 ${
            ride.status === "completed"
              ? "bg-green-500/20"
              : ride.status === "cancelled"
                ? "bg-red-500/20"
                : "bg-yellow-500/20"
          }`}
        >
          <Text
            className={`text-xs capitalize ${
              ride.status === "completed"
                ? "text-green-400"
                : ride.status === "cancelled"
                  ? "text-red-400"
                  : "text-yellow-400"
            }`}
          >
            {ride.status.replace("_", " ")}
          </Text>
        </View>
      </View>

      <View className="mb-3 gap-2">
        <View className="flex-row items-start gap-3">
          <View className="mt-1.5 h-2 w-2 rounded-full bg-green-500" />
          <Text className="flex-1 text-white" numberOfLines={1}>
            {ride.pickupAddress}
          </Text>
        </View>
        <View className="ml-1 h-4 border-zinc-600 border-l border-dashed" />
        <View className="flex-row items-start gap-3">
          <View className="mt-1.5 h-2 w-2 rounded-full bg-red-500" />
          <Text className="flex-1 text-white" numberOfLines={1}>
            {ride.dropoffAddress}
          </Text>
        </View>
      </View>

      {price && (
        <View className="flex-row items-center justify-between border-zinc-700 border-t pt-3">
          <Text className="text-zinc-400">Total</Text>
          <Text className="font-semibold text-white">${price.toFixed(2)}</Text>
        </View>
      )}
    </View>
  );
}

export default function RidesScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const historyQuery = useQuery({
    ...rideQueries.history("rider"),
    enabled: isAuthenticated,
  });

  const rides = (historyQuery.data ?? []) as unknown as Ride[];

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Spinner label="Loading..." />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center gap-6 px-6">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-zinc-800">
            <Text className="text-5xl">🚗</Text>
          </View>
          <View className="items-center gap-2">
            <Text className="font-semibold text-2xl text-white">
              Your Rides
            </Text>
            <Text className="text-center text-zinc-400">
              Sign in to view your ride history
            </Text>
          </View>
          <Button
            onPress={() => router.push("/(auth)/login")}
            className="w-full"
          >
            <Text>Sign In</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="border-zinc-800 border-b px-4 py-4">
        <Text className="font-semibold text-2xl text-white">Your Rides</Text>
      </View>

      {historyQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Spinner label="Loading rides..." />
        </View>
      ) : rides.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-zinc-800">
            <Text className="text-4xl">🚗</Text>
          </View>
          <Text className="text-center text-zinc-400">
            No rides yet. Book your first ride!
          </Text>
          <Pressable onPress={() => router.push("/")}>
            <Text className="text-primary">Go to Main</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={
            <RefreshControl
              refreshing={historyQuery.isFetching}
              onRefresh={() => historyQuery.refetch()}
              tintColor="#c03484"
            />
          }
          renderItem={({ item }) => <RideHistoryCard ride={item} />}
        />
      )}
    </SafeAreaView>
  );
}
