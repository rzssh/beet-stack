import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { router, Stack } from "expo-router";
import * as React from "react";
import { Pressable, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, CardContent, Spinner, Text } from "~/components/ui";
import { darkMapStyle } from "~/constants/map-style";
import { useTaxiSocket } from "~/hooks/useTaxiSocket";
import { useLocationContext } from "~/providers/LocationProvider";
import {
  driverMutations,
  driverQueries,
  rideMutations,
  rideQueries,
} from "~/utils/api";
import { authClient } from "~/utils/auth";

type UserMode = "rider" | "driver";

interface DriverMarker {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
}

export default function Index() {
  const queryClient = useQueryClient();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  const [mode, setMode] = React.useState<UserMode>("rider");
  const [driverMarkers, setDriverMarkers] = React.useState<DriverMarker[]>([]);
  const [pickupAddress, setPickupAddress] = React.useState("");
  const [dropoffAddress, setDropoffAddress] = React.useState("");

  const mapRef = React.useRef<MapView>(null);
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const snapPoints = React.useMemo(() => ["25%", "50%", "90%"], []);

  const {
    location,
    isLoading: locationLoading,
    hasPermission,
    isTracking,
    startTracking,
    stopTracking,
  } = useLocationContext();

  const userId = session?.user?.id ?? "";
  const isReady = !!userId && !!location && hasPermission === true;

  const { isConnected, sendLocation } = useTaxiSocket({
    userId,
    role: mode,
    autoConnect: isReady,
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
    onRideStatus: () => {
      queryClient.invalidateQueries({ queryKey: ["rides", "active"] });
    },
  });

  const driverProfileQuery = useQuery({
    ...driverQueries.profile(),
    enabled: mode === "driver" && isReady,
  });

  const activeRideQuery = useQuery({
    ...rideQueries.active(),
    enabled: isReady,
    refetchInterval: isReady ? 5000 : false,
  });

  const nearbyDriversQuery = useQuery({
    ...driverQueries.nearby(location?.latitude ?? 0, location?.longitude ?? 0),
    enabled: mode === "rider" && isReady,
    refetchInterval: isReady ? 10000 : false,
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

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (nearbyDriversQuery.data) {
      setDriverMarkers(
        nearbyDriversQuery.data
          .filter((d): d is NonNullable<typeof d> => d !== null)
          .map((d) => ({
            driverId: d.driverId,
            lat: d.location.lat,
            lng: d.location.lng,
            heading: d.location.heading ?? undefined,
          })),
      );
    }
  }, [nearbyDriversQuery.data]);

  React.useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [location?.latitude, location?.longitude]);

  const handleRequestRide = React.useCallback(() => {
    if (!isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }
    if (!location || !pickupAddress || !dropoffAddress) return;

    requestRideMutation.mutate({
      pickupLat: location.latitude,
      pickupLng: location.longitude,
      pickupAddress,
      dropoffLat: location.latitude + 0.01,
      dropoffLng: location.longitude + 0.01,
      dropoffAddress,
    });
  }, [
    isAuthenticated,
    location,
    pickupAddress,
    dropoffAddress,
    requestRideMutation,
  ]);

  const toggleMode = React.useCallback(() => {
    if (!isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }
    if (mode === "driver" && driverProfileQuery.data?.isOnline) {
      goOfflineMutation.mutate();
    }
    setMode((prev) => (prev === "rider" ? "driver" : "rider"));
  }, [
    isAuthenticated,
    mode,
    driverProfileQuery.data?.isOnline,
    goOfflineMutation,
  ]);

  const handleBottomSheetInteraction = React.useCallback(() => {
    if (!isAuthenticated) {
      router.push("/(auth)/login");
    }
  }, [isAuthenticated]);

  if (sessionLoading || hasPermission === null || locationLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <Spinner label="Setting up..." />
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-zinc-800">
          <Text className="text-4xl">📍</Text>
        </View>
        <Text variant="h2" className="mb-4 text-center">
          Location Required
        </Text>
        <Text variant="muted" className="mb-6 text-center">
          We need your location to show nearby drivers and calculate routes.
        </Text>
        <Button onPress={() => Linking.openSettings()} className="mb-3 w-full">
          <Text>Open Settings</Text>
        </Button>
        <Button variant="ghost" onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </SafeAreaView>
    );
  }

  if (!location) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <Spinner label="Getting your location..." />
      </SafeAreaView>
    );
  }

  const isDriverOnline = driverProfileQuery.data?.isOnline ?? false;
  const hasDriverProfile = !!driverProfileQuery.data;
  const activeRide = activeRideQuery.data;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="absolute top-16 right-4 left-4 z-10 gap-3">
        <View className="flex-row items-center justify-between">
          {isAuthenticated ? (
            <Pressable
              onPress={() => router.push("/profile")}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg"
            >
              <Text className="text-lg">
                {session.user.name?.[0]?.toUpperCase() ?? "?"}
              </Text>
            </Pressable>
          ) : (
            <Button
              size="sm"
              onPress={() => router.push("/(auth)/login")}
              className="shadow-lg"
            >
              <Text>Sign In</Text>
            </Button>
          )}

          {isAuthenticated && (
            <View
              className={`rounded-full px-3 py-2 ${isConnected ? "bg-green-500" : "bg-red-500"}`}
            >
              <Text className="text-white text-xs">
                {isConnected ? "Live" : "Offline"}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row self-center rounded-full bg-white shadow-lg">
          <Pressable
            onPress={() => mode !== "rider" && toggleMode()}
            className={`rounded-full px-6 py-3 ${mode === "rider" ? "bg-primary" : "bg-white"}`}
          >
            <Text
              className={
                mode === "rider" ? "font-semibold text-white" : "text-gray-600"
              }
            >
              Rider
            </Text>
          </Pressable>
          <Pressable
            onPress={() => mode !== "driver" && toggleMode()}
            className={`rounded-full px-6 py-3 ${mode === "driver" ? "bg-primary" : "bg-white"}`}
          >
            <Text
              className={
                mode === "driver" ? "font-semibold text-white" : "text-gray-600"
              }
            >
              Driver
            </Text>
          </Pressable>
        </View>
      </View>

      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        customMapStyle={darkMapStyle}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {mode === "rider" &&
          driverMarkers.map((marker) => (
            <Marker
              key={marker.driverId}
              identifier={`driver-${marker.driverId}`}
              coordinate={{ latitude: marker.lat, longitude: marker.lng }}
              title="Driver"
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-yellow-500 shadow-lg">
                <Text className="text-lg">🚗</Text>
              </View>
            </Marker>
          ))}
      </MapView>

      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backgroundStyle={{ backgroundColor: "#18181b" }}
        handleIndicatorStyle={{ backgroundColor: "#71717a" }}
        onAnimate={handleBottomSheetInteraction}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        >
          {mode === "rider" ? (
            <View className="gap-4">
              <Text variant="h3" className="text-white">
                {activeRide ? "Active Ride" : "Request a Ride"}
              </Text>

              {!isAuthenticated ? (
                <Card className="border-zinc-700 bg-zinc-800">
                  <CardContent className="gap-3 pt-4">
                    <Text className="text-center text-white">
                      Sign in to request rides
                    </Text>
                    <Button onPress={() => router.push("/(auth)/login")}>
                      <Text>Sign In</Text>
                    </Button>
                  </CardContent>
                </Card>
              ) : activeRide ? (
                <View className="gap-3">
                  <Card className="border-zinc-700 bg-zinc-800">
                    <CardContent className="pt-4">
                      <Text variant="muted">Status</Text>
                      <Text variant="large" className="text-white capitalize">
                        {activeRide.status.replace("_", " ")}
                      </Text>
                    </CardContent>
                  </Card>
                  <Card className="border-zinc-700 bg-zinc-800">
                    <CardContent className="pt-4">
                      <Text variant="muted">Pickup</Text>
                      <Text className="text-white">
                        {activeRide.pickupAddress}
                      </Text>
                    </CardContent>
                  </Card>
                  <Card className="border-zinc-700 bg-zinc-800">
                    <CardContent className="pt-4">
                      <Text variant="muted">Dropoff</Text>
                      <Text className="text-white">
                        {activeRide.dropoffAddress}
                      </Text>
                    </CardContent>
                  </Card>
                  {activeRide.estimatedPrice && (
                    <Card className="border-zinc-700 bg-zinc-800">
                      <CardContent className="pt-4">
                        <Text variant="muted">Estimated Price</Text>
                        <Text variant="h2" className="text-green-400">
                          ${activeRide.estimatedPrice.toFixed(2)}
                        </Text>
                      </CardContent>
                    </Card>
                  )}
                </View>
              ) : (
                <View className="gap-3">
                  <BottomSheetTextInput
                    style={{
                      backgroundColor: "#27272a",
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      color: "#fff",
                      fontSize: 16,
                    }}
                    placeholder="Pickup location"
                    placeholderTextColor="#71717a"
                    value={pickupAddress}
                    onChangeText={setPickupAddress}
                  />
                  <BottomSheetTextInput
                    style={{
                      backgroundColor: "#27272a",
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      color: "#fff",
                      fontSize: 16,
                    }}
                    placeholder="Where to?"
                    placeholderTextColor="#71717a"
                    value={dropoffAddress}
                    onChangeText={setDropoffAddress}
                  />
                  <Button
                    onPress={handleRequestRide}
                    disabled={
                      requestRideMutation.isPending ||
                      !pickupAddress ||
                      !dropoffAddress
                    }
                  >
                    {requestRideMutation.isPending ? (
                      <Spinner size="small" color="white" />
                    ) : (
                      <Text>Request Ride</Text>
                    )}
                  </Button>
                </View>
              )}
            </View>
          ) : (
            <View className="gap-4">
              <Text variant="h3" className="text-white">
                Driver Mode
              </Text>

              {!isAuthenticated ? (
                <Card className="border-zinc-700 bg-zinc-800">
                  <CardContent className="gap-3 pt-4">
                    <Text className="text-center text-white">
                      Sign in to drive
                    </Text>
                    <Button onPress={() => router.push("/(auth)/login")}>
                      <Text>Sign In</Text>
                    </Button>
                  </CardContent>
                </Card>
              ) : !hasDriverProfile ? (
                <View className="gap-3">
                  <Text variant="muted">
                    You need to register as a driver first
                  </Text>
                  <Button onPress={() => router.push("/taxi/register-driver")}>
                    <Text>Register as Driver</Text>
                  </Button>
                </View>
              ) : (
                <View className="gap-4">
                  <Card className="border-zinc-700 bg-zinc-800">
                    <CardContent className="flex-row items-center justify-between pt-4">
                      <View>
                        <Text className="text-white">
                          {driverProfileQuery.data?.vehicleMake}{" "}
                          {driverProfileQuery.data?.vehicleModel}
                        </Text>
                        <Text variant="muted">
                          {driverProfileQuery.data?.licensePlate}
                        </Text>
                      </View>
                      <View
                        className={`rounded-full px-3 py-1 ${isDriverOnline ? "bg-green-500" : "bg-zinc-600"}`}
                      >
                        <Text className="text-white text-xs">
                          {isDriverOnline ? "Online" : "Offline"}
                        </Text>
                      </View>
                    </CardContent>
                  </Card>

                  <Button
                    variant={isDriverOnline ? "destructive" : "default"}
                    onPress={() =>
                      isDriverOnline
                        ? goOfflineMutation.mutate()
                        : goOnlineMutation.mutate()
                    }
                    disabled={
                      goOnlineMutation.isPending || goOfflineMutation.isPending
                    }
                    className={!isDriverOnline ? "bg-green-500" : undefined}
                  >
                    {goOnlineMutation.isPending ||
                    goOfflineMutation.isPending ? (
                      <Spinner size="small" color="white" />
                    ) : (
                      <Text>{isDriverOnline ? "Go Offline" : "Go Online"}</Text>
                    )}
                  </Button>

                  {isDriverOnline && (
                    <Card className="border-zinc-700 bg-zinc-800">
                      <CardContent className="pt-4">
                        <Text variant="muted">Your Location</Text>
                        <Text className="text-white">
                          {location.latitude.toFixed(5)},{" "}
                          {location.longitude.toFixed(5)}
                        </Text>
                        {isTracking && (
                          <Text variant="small" className="mt-1 text-green-400">
                            Location tracking active
                          </Text>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </View>
              )}
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </>
  );
}
