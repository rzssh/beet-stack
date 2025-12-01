import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { router, Stack } from "expo-router";
import * as React from "react";
import { Pressable, View } from "react-native";
import MapView from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  RideMap,
  RideRequestForm,
  DriverDashboard,
  DriverRideController,
  RiderStatusDisplay,
  RideRating,
} from "~/components/ride";
import { Button, Card, CardContent, Spinner, Text } from "~/components/ui";
import { useActiveRide } from "~/hooks/useActiveRide";
import { useDirections } from "~/hooks/useDirections";
import { useTaxiSocket } from "~/hooks/useTaxiSocket";
import { useAuth, useTaxiMode } from "~/lib/hooks";
import { useLocationContext } from "~/providers/LocationProvider";
import {
  driverMutations,
  driverQueries,
} from "~/utils/api";

interface DriverMarker {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
}

interface Location {
  lat: number;
  lng: number;
  address: string;
}

export default function Index() {
  const queryClient = useQueryClient();
  const { session, isLoading: sessionLoading, isAuthenticated } = useAuth();
  const { mode, toggleMode: toggleTaxiMode } = useTaxiMode();
  const [pickupLocation, setPickupLocation] = React.useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = React.useState<Location | null>(null);
  const [driverMarkers, setDriverMarkers] = React.useState<DriverMarker[]>([]);

  // Debug location updates
  React.useEffect(() => {
    console.log("📍 Locations updated:", {
      pickup: pickupLocation ? `${pickupLocation.lat}, ${pickupLocation.lng}` : "null",
      dropoff: dropoffLocation ? `${dropoffLocation.lat}, ${dropoffLocation.lng}` : "null",
    });
  }, [pickupLocation, dropoffLocation]);

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

  const handleDriverLocation = React.useCallback((loc: DriverMarker) => {
    setDriverMarkers((prev) => {
      const existing = prev.findIndex((m) => m.driverId === loc.driverId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = loc;
        return updated;
      }
      return [...prev, loc];
    });
  }, []);

  const handleRideStatus = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["rides", "active"] });
  }, [queryClient]);

  const { isConnected, sendLocation } = useTaxiSocket({
    userId,
    role: mode,
    autoConnect: isReady,
    onDriverLocation: handleDriverLocation,
    onRideStatus: handleRideStatus,
  });

  const driverProfileQuery = useQuery({
    ...driverQueries.profile(),
    enabled: mode === "driver" && isReady,
  });

  const activeRideQuery = useActiveRide();

  const nearbyDriversQuery = useQuery({
    ...driverQueries.nearby(location?.latitude ?? 0, location?.longitude ?? 0),
    enabled: mode === "rider" && isReady,
    refetchInterval: isReady ? 10000 : false,
  });

  // Use activeRide coordinates if available, otherwise use form state
  const effectivePickup = activeRide
    ? {
        lat: activeRide.pickupLat,
        lng: activeRide.pickupLng,
        address: activeRide.pickupAddress,
      }
    : pickupLocation;

  const effectiveDropoff = activeRide
    ? {
        lat: activeRide.dropoffLat,
        lng: activeRide.dropoffLng,
        address: activeRide.dropoffAddress,
      }
    : dropoffLocation;

  const directionsQuery = useDirections({
    origin: effectivePickup
      ? { lat: effectivePickup.lat, lng: effectivePickup.lng }
      : null,
    destination: effectiveDropoff
      ? { lat: effectiveDropoff.lat, lng: effectiveDropoff.lng }
      : null,
  });

  // Debug directions
  React.useEffect(() => {
    if (directionsQuery.data) {
      console.log("✅ Directions loaded:", {
        hasPolyline: !!directionsQuery.data.polyline,
        distance: directionsQuery.data.distance,
        duration: directionsQuery.data.duration,
      });
    }
    if (directionsQuery.error) {
      console.log("❌ Directions error:", directionsQuery.error.message);
    }
  }, [directionsQuery.data, directionsQuery.error]);

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

  const toggleMode = React.useCallback(() => {
    if (!isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }
    if (mode === "driver" && driverProfileQuery.data?.isOnline) {
      goOfflineMutation.mutate();
    }
    toggleTaxiMode();
  }, [
    isAuthenticated,
    mode,
    driverProfileQuery.data?.isOnline,
    goOfflineMutation,
    toggleTaxiMode,
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

      <RideMap
        ref={mapRef}
        location={location}
        mode={mode}
        driverMarkers={driverMarkers}
        pickupLocation={effectivePickup}
        dropoffLocation={effectiveDropoff}
        directionsQuery={directionsQuery}
      />

      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backgroundStyle={{ backgroundColor: "#18181b" }}
        handleIndicatorStyle={{ backgroundColor: "#71717a" }}
        onAnimate={handleBottomSheetInteraction}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {mode === "rider" ? (
            <View className="gap-4">
              {activeRide ? (
                activeRide.status === "completed" ? (
                  <RideRating
                    ride={activeRide}
                    onComplete={() => {
                      queryClient.invalidateQueries({ queryKey: ["rides"] });
                    }}
                  />
                ) : (
                  <RiderStatusDisplay
                    ride={activeRide}
                    onComplete={() => {
                      queryClient.invalidateQueries({ queryKey: ["rides"] });
                    }}
                  />
                )
              ) : (
                <RideRequestForm
                  activeRide={activeRide}
                  onLocationsChange={(pickup, dropoff) => {
                    setPickupLocation(pickup);
                    setDropoffLocation(dropoff);
                  }}
                />
              )}
            </View>
          ) : (
            <View className="gap-4">
              {!isAuthenticated ? (
                <>
                  <Text variant="h3" className="text-white">
                    Driver Mode
                  </Text>
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
                </>
              ) : !hasDriverProfile ? (
                <>
                  <Text variant="h3" className="text-white">
                    Driver Mode
                  </Text>
                  <View className="gap-3">
                    <Text variant="muted">
                      You need to register as a driver first
                    </Text>
                    <Button onPress={() => router.push("/taxi/register-driver")}>
                      <Text>Register as Driver</Text>
                    </Button>
                  </View>
                </>
              ) : (
                <>
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

                  {!isDriverOnline ? (
                    <Button
                      onPress={() => goOnlineMutation.mutate()}
                      disabled={goOnlineMutation.isPending}
                      className="bg-green-500"
                    >
                      {goOnlineMutation.isPending ? (
                        <Spinner size="small" color="white" />
                      ) : (
                        <Text className="font-semibold">Go Online</Text>
                      )}
                    </Button>
                  ) : activeRide ? (
                    <DriverRideController ride={activeRide} />
                  ) : (
                    <>
                      <DriverDashboard />
                      <Button
                        variant="destructive"
                        onPress={() => goOfflineMutation.mutate()}
                        disabled={goOfflineMutation.isPending}
                      >
                        {goOfflineMutation.isPending ? (
                          <Spinner size="small" color="white" />
                        ) : (
                          <Text>Go Offline</Text>
                        )}
                      </Button>
                    </>
                  )}
                </>
              )}
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </>
  );
}
