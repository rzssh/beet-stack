import { useMutation, useQueryClient } from "@tanstack/react-query";
import { View } from "react-native";

import { Button, Card, CardContent, Spinner, Text } from "~/components/ui";
import { rideMutations } from "~/utils/api";

interface RiderStatusDisplayProps {
  ride: {
    id: string;
    status: string;
    pickupAddress: string;
    dropoffAddress: string;
    estimatedPrice?: number | null;
    driver?: {
      id: string;
      name: string | null;
      image: string | null;
    } | null;
  };
  onComplete?: () => void;
}

export function RiderStatusDisplay({
  ride,
  onComplete,
}: RiderStatusDisplayProps) {
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    ...rideMutations.cancel(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
    },
  });

  const getStatusDisplay = () => {
    switch (ride.status) {
      case "requested":
        return {
          icon: "🔍",
          title: "Finding Driver",
          description: "Searching for nearby drivers...",
          color: "blue",
          canCancel: true,
        };
      case "accepted":
        return {
          icon: "🚗",
          title: "Driver on the Way",
          description: "Your driver is heading to pickup location",
          color: "yellow",
          canCancel: true,
        };
      case "driver_arrived":
        return {
          icon: "👋",
          title: "Driver Arrived",
          description: "Your driver is waiting for you",
          color: "green",
          canCancel: false,
        };
      case "in_progress":
        return {
          icon: "🏁",
          title: "Ride in Progress",
          description: "Heading to your destination",
          color: "purple",
          canCancel: false,
        };
      case "completed":
        return {
          icon: "✅",
          title: "Ride Completed",
          description: "You've arrived at your destination",
          color: "green",
          canCancel: false,
        };
      default:
        return {
          icon: "❓",
          title: "Unknown Status",
          description: ride.status,
          color: "gray",
          canCancel: false,
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-3">
        <Text className="text-3xl">{statusDisplay.icon}</Text>
        <View className="flex-1">
          <Text variant="h3" className="text-white">
            {statusDisplay.title}
          </Text>
          <Text className="text-zinc-400 text-sm">
            {statusDisplay.description}
          </Text>
        </View>
      </View>

      {ride.driver && (
        <Card className="border-zinc-700 bg-zinc-800">
          <CardContent className="flex-row items-center gap-3 pt-4">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-zinc-700">
              <Text className="text-2xl">
                {ride.driver.name?.[0]?.toUpperCase() ?? "D"}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-semibold">
                {ride.driver.name ?? "Your Driver"}
              </Text>
              <Text className="text-zinc-400 text-sm">Driver</Text>
            </View>
            <View className="items-center">
              <View className="rounded-full bg-green-500 px-3 py-1">
                <Text className="text-white text-xs font-semibold">
                  {ride.status === "accepted"
                    ? "Coming"
                    : ride.status === "driver_arrived"
                      ? "Arrived"
                      : "Driving"}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>
      )}

      <Card className="border-zinc-700 bg-zinc-800">
        <CardContent className="gap-3 pt-4">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg">📍</Text>
            <View className="flex-1">
              <Text className="text-xs text-zinc-400">Pickup</Text>
              <Text className="text-white" numberOfLines={2}>
                {ride.pickupAddress}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            <Text className="text-lg">🎯</Text>
            <View className="flex-1">
              <Text className="text-xs text-zinc-400">Dropoff</Text>
              <Text className="text-white" numberOfLines={2}>
                {ride.dropoffAddress}
              </Text>
            </View>
          </View>

          {ride.estimatedPrice && (
            <View className="pt-3 border-t border-zinc-700">
              <Text className="text-zinc-400 text-xs">Estimated Fare</Text>
              <Text variant="h2" className="text-green-400">
                ${ride.estimatedPrice.toFixed(2)}
              </Text>
            </View>
          )}
        </CardContent>
      </Card>

      {statusDisplay.canCancel && (
        <Button
          variant="destructive"
          onPress={() =>
            cancelMutation.mutate({
              rideId: ride.id,
              reason: "Cancelled by rider",
            })
          }
          disabled={cancelMutation.isPending}
        >
          {cancelMutation.isPending ? (
            <Spinner size="small" color="white" />
          ) : (
            <Text>Cancel Ride</Text>
          )}
        </Button>
      )}

      {ride.status === "completed" && onComplete && (
        <Button onPress={onComplete} className="bg-blue-500">
          <Text className="font-semibold">Rate Driver</Text>
        </Button>
      )}
    </View>
  );
}
