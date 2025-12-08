import { Ionicons } from "@expo/vector-icons";
import type BottomSheet from "@gorhom/bottom-sheet";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import type MapView from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppDrawer } from "~/components/drawer";
import {
  CenterButton,
  MainBottomSheet,
  MapPinOverlay,
} from "~/components/main";
import { RideMap } from "~/components/ride";
import { Button, Spinner, Text } from "~/components/ui";

// const ActionButton = () => {
//   return (
//     <Link href="/feed/add-post" asChild>
//       <Pressable>
//         <Text className="px-3 text-primary-300">Create</Text>
//       </Pressable>
//     </Link>
//   );
// };

export default function MainScreen() {
  const queryClient = useQueryClient();
  const { session, isLoading: sessionLoading, isAuthenticated } = useAuth();
  const openDrawer = useDrawerStore((s) => s.open);
  const [pickupLocation, setPickupLocation] = React.useState<Location | null>(
    null,
  );
  const [dropoffLocation, setDropoffLocation] = React.useState<Location | null>(
    null,
  );
  const [driverMarkers, setDriverMarkers] = React.useState<DriverMarker[]>([]);
  const [reverseGeocodeAddress, setReverseGeocodeAddress] = React.useState<
    string | null
  >(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = React.useState(false);

  const mapRef = React.useRef<MapView>(null);
  const bottomSheetRef = React.useRef<BottomSheet>(null!);
  const sheetAnimatedIndex = useSharedValue(0);
  const [isSheetExpanded, setIsSheetExpanded] = React.useState(false);

  useAnimatedReaction(
    () => sheetAnimatedIndex.value > 0.3,
    (expanded) => {
      runOnJS(setIsSheetExpanded)(expanded);
    },
    [sheetAnimatedIndex],
  );

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(sheetAnimatedIndex.value, [0, 0.3], [1, 0]);
    return { opacity };
  });

  const mapMode = useMapStateStore((s) => s.mode);
  const isPannedAway = useMapStateStore((s) => s.isPannedAway);
  const pendingCoordinate = useMapStateStore((s) => s.pendingCoordinate);
  const setMapMode = useMapStateStore((s) => s.setMode);
  const setPannedAway = useMapStateStore((s) => s.setPannedAway);
  const setPendingCoordinate = useMapStateStore((s) => s.setPendingCoordinate);
  const resetMapState = useMapStateStore((s) => s.reset);

  const {
    location,
    isLoading: locationLoading,
    hasPermission,
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

  const { isConnected } = useTaxiSocket({
    userId,
    role: "rider",
    autoConnect: isReady,
    onDriverLocation: handleDriverLocation,
    onRideStatus: handleRideStatus,
  });

  const activeRideQuery = useActiveRide();
  const activeRide = activeRideQuery.data;

  const nearbyDriversQuery = useQuery({
    ...driverQueries.nearby(location?.latitude ?? 0, location?.longitude ?? 0),
    enabled: isReady,
    refetchInterval: isReady ? 10000 : false,
  });

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

  const handleCenterMap = React.useCallback(() => {
    if (!mapRef.current || !location) return;

    mapRef.current.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setPannedAway(false);
  }, [location, setPannedAway]);

  const handleMapRegionChange = React.useCallback(
    (region: { latitude: number; longitude: number }) => {
      if (!location) return;

      const distance = Math.sqrt(
        (region.latitude - location.latitude) ** 2 +
          (region.longitude - location.longitude) ** 2,
      );

      setPannedAway(distance > 0.001);

      if (mapMode !== "default") {
        setPendingCoordinate({ lat: region.latitude, lng: region.longitude });
        setIsReverseGeocoding(true);
        setReverseGeocodeAddress(
          `${region.latitude.toFixed(6)}, ${region.longitude.toFixed(6)}`,
        );
        setIsReverseGeocoding(false);
      }
    },
    [location, mapMode, setPannedAway, setPendingCoordinate],
  );

  const handleConfirmMapPin = React.useCallback(() => {
    if (!pendingCoordinate || !reverseGeocodeAddress) return;

    const newLocation: Location = {
      lat: pendingCoordinate.lat,
      lng: pendingCoordinate.lng,
      address: reverseGeocodeAddress,
    };

    if (mapMode === "pin-pickup") {
      setPickupLocation(newLocation);
    } else if (mapMode === "pin-dropoff") {
      setDropoffLocation(newLocation);
    }

    resetMapState();
    setReverseGeocodeAddress(null);
  }, [pendingCoordinate, reverseGeocodeAddress, mapMode, resetMapState]);

  const handleCancelMapPin = React.useCallback(() => {
    resetMapState();
    setReverseGeocodeAddress(null);
  }, [resetMapState]);

  const handleRequestRide = React.useCallback(() => {
    // This will be handled by the form submission in RideRequestForm
  }, []);

  if (sessionLoading || hasPermission === null || locationLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Spinner label="Setting up..." />
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
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
        <Spinner label="Getting your location..." />
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <RideMap
        ref={mapRef}
        location={location}
        mode="rider"
        driverMarkers={driverMarkers}
        pickupLocation={effectivePickup}
        dropoffLocation={effectiveDropoff}
        directionsQuery={directionsQuery}
        onRegionChangeComplete={handleMapRegionChange}
      />

      <Animated.View
        style={[
          overlayAnimatedStyle,
          {
            position: "absolute",
            top: insets.top + 8,
            left: 16,
            right: 16,
            zIndex: 10,
          },
        ]}
        pointerEvents={isSheetExpanded ? "none" : "auto"}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={openDrawer}
            className="h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg"
          >
            <Ionicons name="menu" size={24} color="#18181b" />
          </Pressable>

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
      </Animated.View>

      <AppDrawer />

      {mapMode !== "default" && (
        <MapPinOverlay
          type={mapMode === "pin-pickup" ? "pickup" : "dropoff"}
          address={reverseGeocodeAddress}
          isLoading={isReverseGeocoding}
          onConfirm={handleConfirmMapPin}
          onCancel={handleCancelMapPin}
        />
      )}

      <CenterButton
        visible={isPannedAway && mapMode === "default"}
        onPress={handleCenterMap}
        bottomOffset={200}
      />

      <MainBottomSheet
        bottomSheetRef={bottomSheetRef}
        activeRide={activeRide}
        pickupLocation={pickupLocation}
        dropoffLocation={dropoffLocation}
        onPickupChange={setPickupLocation}
        onDropoffChange={setDropoffLocation}
        onRequestRide={handleRequestRide}
        sheetAnimatedIndex={sheetAnimatedIndex}
      />
    </View>
  );
}
