import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { View } from "react-native";

import { Button, Card, CardContent, Spinner, Text } from "~/components/ui";
import { useLocationContext } from "~/providers/LocationProvider";
import { rideMutations, rideQueries } from "~/utils/api";

export function DriverDashboard() {
  const queryClient = useQueryClient();
  const { location } = useLocationContext();
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);

  const pendingRidesQuery = useQuery({
    ...rideQueries.pending(
      location?.latitude ?? 0,
      location?.longitude ?? 0,
    ),
    enabled: !!location,
    refetchInterval: 5000,
  });

  const acceptRideMutation = useMutation({
    ...rideMutations.accept(),
    onSuccess: () => {
      setSelectedRideId(null);
      queryClient.invalidateQueries({ queryKey: ["rides"] });
    },
  });

  const pendingRides = pendingRidesQuery.data ?? [];

  if (!location) {
    return (
      <View className="gap-4">
        <Text variant="h3" className="text-white">
          Driver Dashboard
        </Text>
        <Card className="border-zinc-700 bg-zinc-800">
          <CardContent className="pt-4">
            <Text className="text-center text-zinc-400">
              Waiting for location...
            </Text>
          </CardContent>
        </Card>
      </View>
    );
  }

  if (pendingRidesQuery.isLoading) {
    return (
      <View className="gap-4">
        <Text variant="h3" className="text-white">
          Driver Dashboard
        </Text>
        <Spinner label="Loading ride requests..." />
      </View>
    );
  }

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text variant="h3" className="text-white">
          Ride Requests
        </Text>
        {pendingRides.length > 0 && (
          <View className="rounded-full bg-blue-500 px-3 py-1">
            <Text className="text-white text-xs font-semibold">
              {pendingRides.length}
            </Text>
          </View>
        )}
      </View>

      {pendingRides.length === 0 ? (
        <Card className="border-zinc-700 bg-zinc-800">
          <CardContent className="items-center gap-3 pt-4">
            <Text className="text-4xl">🔍</Text>
            <Text className="text-center text-white">
              No ride requests nearby
            </Text>
            <Text className="text-center text-zinc-400 text-sm">
              Waiting for riders in your area...
            </Text>
          </CardContent>
        </Card>
      ) : (
        <View className="gap-3">
          {pendingRides.map((ride) => (
            <Card key={ride.id} className="border-zinc-700 bg-zinc-800">
              <CardContent className="gap-3 pt-4">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 gap-2">
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
                  </View>

                  <View className="items-end">
                    <Text variant="h3" className="text-green-400">
                      ${ride.estimatedPrice?.toFixed(2) ?? "0.00"}
                    </Text>
                    {ride.estimatedDistanceKm && (
                      <Text className="text-zinc-400 text-xs">
                        {ride.estimatedDistanceKm.toFixed(1)} km
                      </Text>
                    )}
                  </View>
                </View>

                <Button
                  onPress={() => acceptRideMutation.mutate(ride.id)}
                  disabled={
                    acceptRideMutation.isPending &&
                    selectedRideId === ride.id
                  }
                  className="bg-green-500"
                >
                  {acceptRideMutation.isPending &&
                  selectedRideId === ride.id ? (
                    <Spinner size="small" color="white" />
                  ) : (
                    <Text className="font-semibold">Accept Ride</Text>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}
