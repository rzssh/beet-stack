import Mapbox from "@rnmapbox/maps";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLocation } from "~/hooks/useLocation";
import { useTaxiSocket } from "~/hooks/useTaxiSocket";
import {
  driverMutations,
  driverQueries,
  rideMutations,
  rideQueries,
} from "~/utils/api";
import { authClient } from "~/utils/auth";

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? "");

type UserMode = "rider" | "driver";

interface DriverMarker {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
}

export default function TaxiScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  const [mode, setMode] = useState<UserMode>("rider");
  const [driverMarkers, setDriverMarkers] = useState<DriverMarker[]>([]);
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  const {
    location,
    error: locationError,
    isLoading: locationLoading,
    hasPermission,
    requestPermission,
    startTracking,
    stopTracking,
    isTracking,
  } = useLocation({ trackingInterval: 5000 });

  const userId = session?.user?.id ?? "";

  const { isConnected, sendLocation } = useTaxiSocket({
    userId,
    role: mode,
    autoConnect: !!userId,
    onDriverLocation: (loc) => {
      setDriverMarkers((prev) => {
        const existing = prev.findIndex((m) => m.driverId === loc.driverId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = loc;
          return updated;
        }
        return [...prev, loc];
      });
    },
    onRideStatus: (status) => {
      queryClient.invalidateQueries({ queryKey: ["rides", "active"] });
    },
  });

  const driverProfileQuery = useQuery({
    ...driverQueries.profile(),
    enabled: mode === "driver" && !!userId,
  });

  const activeRideQuery = useQuery({
    ...rideQueries.active(),
    enabled: !!userId,
    refetchInterval: 5000,
  });

  const nearbyDriversQuery = useQuery({
    ...driverQueries.nearby(location?.latitude ?? 0, location?.longitude ?? 0),
    enabled: mode === "rider" && !!location,
    refetchInterval: 10000,
  });

  const goOnlineMutation = useMutation({
    ...driverMutations.goOnline(),
    onSuccess: () => {
      startTracking();
      queryClient.invalidateQueries({ queryKey: ["driver", "profile"] });
    },
  });

  const goOfflineMutation = useMutation({
    ...driverMutations.goOffline(),
    onSuccess: () => {
      stopTracking();
      queryClient.invalidateQueries({ queryKey: ["driver", "profile"] });
    },
  });

  const updateLocationMutation = useMutation(driverMutations.updateLocation());

  const requestRideMutation = useMutation({
    ...rideMutations.request(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rides", "active"] });
      bottomSheetRef.current?.snapToIndex(0);
    },
  });

  useEffect(() => {
    if (mode === "driver" && isTracking && location) {
      sendLocation(
        location.latitude,
        location.longitude,
        location.heading ?? undefined,
        location.speed ?? undefined,
      );
      updateLocationMutation.mutate({
        lat: location.latitude,
        lng: location.longitude,
        heading: location.heading ?? undefined,
        speed: location.speed ?? undefined,
      });
    }
  }, [location, mode, isTracking]);

  useEffect(() => {
    if (nearbyDriversQuery.data) {
      setDriverMarkers(
        nearbyDriversQuery.data.map((d: any) => ({
          driverId: d.driverId,
          lat: d.location.lat,
          lng: d.location.lng,
          heading: d.location.heading,
        })),
      );
    }
  }, [nearbyDriversQuery.data]);

  const handleRequestRide = useCallback(() => {
    if (!location || !pickupAddress || !dropoffAddress) return;

    requestRideMutation.mutate({
      pickupLat: location.latitude,
      pickupLng: location.longitude,
      pickupAddress,
      dropoffLat: location.latitude + 0.01,
      dropoffLng: location.longitude + 0.01,
      dropoffAddress,
    });
  }, [location, pickupAddress, dropoffAddress, requestRideMutation]);

  const toggleMode = useCallback(() => {
    if (mode === "driver" && driverProfileQuery.data?.isOnline) {
      goOfflineMutation.mutate();
    }
    setMode((prev) => (prev === "rider" ? "driver" : "rider"));
  }, [mode, driverProfileQuery.data?.isOnline, goOfflineMutation]);

  if (!session) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="mb-4 text-xl text-foreground">Please sign in to continue</Text>
        <Pressable
          onPress={() => router.push("/")}
          className="rounded-lg bg-primary px-6 py-3"
        >
          <Text className="font-semibold text-white">Go to Login</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!hasPermission) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="mb-4 text-center text-xl text-foreground">
          Location permission required
        </Text>
        <Pressable
          onPress={requestPermission}
          className="rounded-lg bg-primary px-6 py-3"
        >
          <Text className="font-semibold text-white">Grant Permission</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (locationLoading || !location) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#c03484" />
        <Text className="mt-4 text-foreground">Getting your location...</Text>
      </SafeAreaView>
    );
  }

  const isDriverOnline = driverProfileQuery.data?.isOnline ?? false;
  const hasDriverProfile = !!driverProfileQuery.data;
  const activeRide = activeRideQuery.data;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="absolute left-4 right-4 top-16 z-10 flex-row items-center justify-between">
        <View className="flex-row rounded-full bg-white shadow-lg">
          <Pressable
            onPress={() => mode !== "rider" && toggleMode()}
            className={`rounded-full px-6 py-3 ${mode === "rider" ? "bg-primary" : "bg-white"}`}
          >
            <Text className={mode === "rider" ? "font-semibold text-white" : "text-gray-600"}>
              Rider
            </Text>
          </Pressable>
          <Pressable
            onPress={() => mode !== "driver" && toggleMode()}
            className={`rounded-full px-6 py-3 ${mode === "driver" ? "bg-primary" : "bg-white"}`}
          >
            <Text className={mode === "driver" ? "font-semibold text-white" : "text-gray-600"}>
              Driver
            </Text>
          </Pressable>
        </View>

        <View
          className={`rounded-full px-3 py-2 ${isConnected ? "bg-green-500" : "bg-red-500"}`}
        >
          <Text className="text-xs text-white">{isConnected ? "Live" : "Offline"}</Text>
        </View>
      </View>

      <Mapbox.MapView
        style={{ flex: 1 }}
        styleURL={Mapbox.StyleURL.Street}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Mapbox.Camera
          zoomLevel={14}
          centerCoordinate={[location.longitude, location.latitude]}
          animationMode="flyTo"
          animationDuration={1000}
        />

        <Mapbox.PointAnnotation
          id="user-location"
          coordinate={[location.longitude, location.latitude]}
        >
          <View
            className={`h-6 w-6 items-center justify-center rounded-full border-2 border-white ${mode === "rider" ? "bg-blue-500" : "bg-green-500"}`}
          >
            <View className="h-2 w-2 rounded-full bg-white" />
          </View>
        </Mapbox.PointAnnotation>

        {mode === "rider" &&
          driverMarkers.map((marker) => (
            <Mapbox.PointAnnotation
              key={marker.driverId}
              id={`driver-${marker.driverId}`}
              coordinate={[marker.lng, marker.lat]}
            >
              <View className="h-8 w-8 items-center justify-center rounded-full bg-yellow-500 shadow-lg">
                <Text className="text-sm">🚗</Text>
              </View>
            </Mapbox.PointAnnotation>
          ))}
      </Mapbox.MapView>

      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: "#18181b" }}
        handleIndicatorStyle={{ backgroundColor: "#71717a" }}
      >
        <BottomSheetView className="flex-1 px-4">
          {mode === "rider" ? (
            <View className="gap-4">
              <Text className="text-xl font-bold text-white">
                {activeRide ? "Active Ride" : "Request a Ride"}
              </Text>

              {activeRide ? (
                <View className="gap-3">
                  <View className="rounded-lg bg-zinc-800 p-4">
                    <Text className="text-sm text-zinc-400">Status</Text>
                    <Text className="text-lg font-semibold capitalize text-white">
                      {activeRide.status.replace("_", " ")}
                    </Text>
                  </View>
                  <View className="rounded-lg bg-zinc-800 p-4">
                    <Text className="text-sm text-zinc-400">Pickup</Text>
                    <Text className="text-white">{activeRide.pickupAddress}</Text>
                  </View>
                  <View className="rounded-lg bg-zinc-800 p-4">
                    <Text className="text-sm text-zinc-400">Dropoff</Text>
                    <Text className="text-white">{activeRide.dropoffAddress}</Text>
                  </View>
                  {activeRide.estimatedPrice && (
                    <View className="rounded-lg bg-zinc-800 p-4">
                      <Text className="text-sm text-zinc-400">Estimated Price</Text>
                      <Text className="text-2xl font-bold text-green-400">
                        ${activeRide.estimatedPrice.toFixed(2)}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View className="gap-3">
                  <TextInput
                    className="rounded-lg bg-zinc-800 px-4 py-3 text-white"
                    placeholder="Pickup location"
                    placeholderTextColor="#71717a"
                    value={pickupAddress}
                    onChangeText={setPickupAddress}
                  />
                  <TextInput
                    className="rounded-lg bg-zinc-800 px-4 py-3 text-white"
                    placeholder="Where to?"
                    placeholderTextColor="#71717a"
                    value={dropoffAddress}
                    onChangeText={setDropoffAddress}
                  />
                  <Pressable
                    onPress={handleRequestRide}
                    disabled={
                      requestRideMutation.isPending || !pickupAddress || !dropoffAddress
                    }
                    className={`rounded-lg py-4 ${
                      !pickupAddress || !dropoffAddress
                        ? "bg-zinc-700"
                        : "bg-primary"
                    }`}
                  >
                    <Text className="text-center font-semibold text-white">
                      {requestRideMutation.isPending ? "Requesting..." : "Request Ride"}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          ) : (
            <View className="gap-4">
              <Text className="text-xl font-bold text-white">Driver Mode</Text>

              {!hasDriverProfile ? (
                <View className="gap-3">
                  <Text className="text-zinc-400">
                    You need to register as a driver first
                  </Text>
                  <Pressable
                    onPress={() => router.push("/taxi/register-driver")}
                    className="rounded-lg bg-primary py-4"
                  >
                    <Text className="text-center font-semibold text-white">
                      Register as Driver
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View className="gap-4">
                  <View className="flex-row items-center justify-between rounded-lg bg-zinc-800 p-4">
                    <View>
                      <Text className="text-white">
                        {driverProfileQuery.data?.vehicleMake}{" "}
                        {driverProfileQuery.data?.vehicleModel}
                      </Text>
                      <Text className="text-sm text-zinc-400">
                        {driverProfileQuery.data?.licensePlate}
                      </Text>
                    </View>
                    <View
                      className={`rounded-full px-3 py-1 ${isDriverOnline ? "bg-green-500" : "bg-zinc-600"}`}
                    >
                      <Text className="text-xs text-white">
                        {isDriverOnline ? "Online" : "Offline"}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() =>
                      isDriverOnline
                        ? goOfflineMutation.mutate()
                        : goOnlineMutation.mutate()
                    }
                    disabled={goOnlineMutation.isPending || goOfflineMutation.isPending}
                    className={`rounded-lg py-4 ${isDriverOnline ? "bg-red-500" : "bg-green-500"}`}
                  >
                    <Text className="text-center font-semibold text-white">
                      {goOnlineMutation.isPending || goOfflineMutation.isPending
                        ? "Loading..."
                        : isDriverOnline
                          ? "Go Offline"
                          : "Go Online"}
                    </Text>
                  </Pressable>

                  {isDriverOnline && (
                    <View className="rounded-lg bg-zinc-800 p-4">
                      <Text className="text-sm text-zinc-400">Your Location</Text>
                      <Text className="text-white">
                        {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                      </Text>
                      {isTracking && (
                        <Text className="mt-1 text-xs text-green-400">
                          Location tracking active
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}
