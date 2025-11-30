import { useMutation, useQueryClient } from "@tanstack/react-query";
import { View } from "react-native";

import { Button, Card, CardContent, Spinner, Text } from "~/components/ui";
import { rideMutations } from "~/utils/api";

interface DriverRideControllerProps {
  ride: {
    id: string;
    status: string;
    pickupAddress: string;
    dropoffAddress: string;
    estimatedPrice?: number | null;
    rider?: {
      id: string;
      name: string | null;
      image: string | null;
    } | null;
  };
}

export function DriverRideController({ ride }: DriverRideControllerProps) {
  const queryClient = useQueryClient();

  const arrivedMutation = useMutation({
    ...rideMutations.arrived(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
    },
  });

  const startMutation = useMutation({
    ...rideMutations.start(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
    },
  });

  const completeMutation = useMutation({
    ...rideMutations.complete(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
    },
  });

  const getStatusDisplay = () => {
    switch (ride.status) {
      case "accepted":
        return {
          icon: "🚗",
          title: "Heading to Pickup",
          description: "Navigate to pickup location",
          action: (
            <Button
              onPress={() => arrivedMutation.mutate(ride.id)}
              disabled={arrivedMutation.isPending}
              className="bg-blue-500"
            >
              {arrivedMutation.isPending ? (
                <Spinner size="small" color="white" />
              ) : (
                <Text className="font-semibold">I've Arrived</Text>
              )}
            </Button>
          ),
        };
      case "driver_arrived":
        return {
          icon: "👋",
          title: "Waiting for Rider",
          description: "Rider will join you shortly",
          action: (
            <Button
              onPress={() => startMutation.mutate(ride.id)}
              disabled={startMutation.isPending}
              className="bg-green-500"
            >
              {startMutation.isPending ? (
                <Spinner size="small" color="white" />
              ) : (
                <Text className="font-semibold">Start Ride</Text>
              )}
            </Button>
          ),
        };
      case "in_progress":
        return {
          icon: "🏁",
          title: "Ride in Progress",
          description: "Navigate to destination",
          action: (
            <Button
              onPress={() => completeMutation.mutate(ride.id)}
              disabled={completeMutation.isPending}
              className="bg-purple-500"
            >
              {completeMutation.isPending ? (
                <Spinner size="small" color="white" />
              ) : (
                <Text className="font-semibold">Complete Ride</Text>
              )}
            </Button>
          ),
        };
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay();
  if (!statusDisplay) return null;

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

      <Card className="border-zinc-700 bg-zinc-800">
        <CardContent className="gap-3 pt-4">
          {ride.rider && (
            <View className="flex-row items-center gap-3 pb-3 border-b border-zinc-700">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-zinc-700">
                <Text className="text-xl">
                  {ride.rider.name?.[0]?.toUpperCase() ?? "?"}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold">
                  {ride.rider.name ?? "Rider"}
                </Text>
                <Text className="text-zinc-400 text-xs">Passenger</Text>
              </View>
            </View>
          )}

          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-lg">📍</Text>
              <View className="flex-1">
                <Text className="text-xs text-zinc-400">
                  {ride.status === "accepted" ? "Pickup" : "From"}
                </Text>
                <Text className="text-white" numberOfLines={2}>
                  {ride.pickupAddress}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2">
              <Text className="text-lg">🎯</Text>
              <View className="flex-1">
                <Text className="text-xs text-zinc-400">
                  {ride.status === "in_progress" ? "Destination" : "Dropoff"}
                </Text>
                <Text className="text-white" numberOfLines={2}>
                  {ride.dropoffAddress}
                </Text>
              </View>
            </View>
          </View>

          {ride.estimatedPrice && (
            <View className="pt-3 border-t border-zinc-700">
              <Text className="text-zinc-400 text-xs">Fare</Text>
              <Text variant="h2" className="text-green-400">
                ${ride.estimatedPrice.toFixed(2)}
              </Text>
            </View>
          )}
        </CardContent>
      </Card>

      {statusDisplay.action}
    </View>
  );
}
