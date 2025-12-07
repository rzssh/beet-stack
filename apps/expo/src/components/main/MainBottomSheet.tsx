import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import * as React from "react";
import { Pressable, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { RiderStatusDisplay, RideRating } from "~/components/ride";
import { Text } from "~/components/ui";
import { useBottomSheetState } from "~/hooks/useBottomSheetState";
import { useAuth } from "~/lib/hooks";
import { useDrawerStore } from "~/stores/drawer-store";
import { RecentDestination } from "~/stores/recent-destinations-store";

import { RecentDestinations } from "./RecentDestinations";
import { ServiceSelector } from "./ServiceSelector";

interface Location {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
  name?: string;
}

interface Ride {
  id: string;
  status: string;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffAddress: string;
  driverId?: string | null;
  estimatedPrice?: number | null;
  finalPrice?: number | null;
}

interface MainBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  activeRide: Ride | null | undefined;
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  onPickupChange: (location: Location | null) => void;
  onDropoffChange: (location: Location | null) => void;
  onRequestRide: () => void;
  sheetAnimatedIndex?: SharedValue<number>;
}

export function MainBottomSheet({
  bottomSheetRef,
  activeRide,
  pickupLocation,
  dropoffLocation,
  onPickupChange,
  onDropoffChange,
  onRequestRide,
  sheetAnimatedIndex,
}: MainBottomSheetProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const openDrawer = useDrawerStore((s) => s.open);
  const internalAnimatedIndex = useSharedValue(0);
  const animatedIndex = sheetAnimatedIndex ?? internalAnimatedIndex;

  const [selectedService, setSelectedService] = React.useState("ride");

  const hasActiveRide = !!activeRide && activeRide.status !== "completed";
  const isRideCompleted = activeRide?.status === "completed";

  const sheetState = useBottomSheetState({ hasActiveRide });

  const handleInputPress = React.useCallback(() => {
    if (!isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }
    router.push("/order");
  }, [isAuthenticated]);

  const handleDestinationSelect = React.useCallback(
    (destination: RecentDestination) => {
      if (!isAuthenticated) {
        router.push("/(auth)/login");
        return;
      }
      router.push({
        pathname: "/order",
        params: { dropoff: JSON.stringify(destination) },
      });
    },
    [isAuthenticated]
  );

  const handleServiceSelect = React.useCallback(
    (service: string) => {
      setSelectedService(service);
      if (service === "ride") {
        if (!isAuthenticated) {
          router.push("/(auth)/login");
          return;
        }
        router.push("/order");
      }
    },
    [isAuthenticated]
  );

  const handleCollapseSheet = React.useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, [bottomSheetRef]);

  const fullHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedIndex.value,
      [0.85, 1],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const expandedContentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedIndex.value,
      [0.15, 0.4],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const renderContent = () => {
    if (isRideCompleted && activeRide) {
      return (
        <RideRating
          ride={activeRide}
          onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ["rides"] });
          }}
        />
      );
    }

    if (hasActiveRide && activeRide) {
      return (
        <RiderStatusDisplay
          ride={activeRide}
          onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ["rides"] });
          }}
        />
      );
    }

    return (
      <View className="gap-4">
        <Animated.View style={fullHeaderStyle} className="flex-row items-center justify-between">
          <Pressable
            onPress={openDrawer}
            className="h-11 w-11 items-center justify-center rounded-full bg-zinc-800 active:bg-zinc-700"
          >
            <Ionicons name="menu" size={22} color="#fff" />
          </Pressable>
          <Pressable
            onPress={handleCollapseSheet}
            className="h-11 w-11 items-center justify-center rounded-full bg-zinc-800 active:bg-zinc-700"
          >
            <Ionicons name="map-outline" size={22} color="#fff" />
          </Pressable>
        </Animated.View>

        <Animated.View style={expandedContentStyle} className="gap-4">
          <Text className="font-semibold text-white text-lg">
            Glad to see you back!
          </Text>

          <ServiceSelector
            selectedService={selectedService}
            onServiceSelect={handleServiceSelect}
            animatedIndex={animatedIndex}
          />
        </Animated.View>

        <Pressable
          onPress={handleInputPress}
          className="flex-row items-center gap-3 rounded-xl bg-zinc-800 px-4 py-4 active:bg-zinc-700"
        >
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/20">
            <Ionicons name="search" size={20} color="#c03484" />
          </View>
          <Text className="flex-1 text-zinc-400 text-lg">Where to?</Text>
          <Ionicons name="chevron-forward" size={20} color="#71717a" />
        </Pressable>

        <Animated.View style={expandedContentStyle}>
          <RecentDestinations
            onSelect={handleDestinationSelect}
            animatedIndex={animatedIndex}
          />
        </Animated.View>
      </View>
    );
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={sheetState.snapIndex}
      snapPoints={sheetState.snapPoints}
      enablePanDownToClose={false}
      animatedIndex={animatedIndex}
      backgroundStyle={{ backgroundColor: "#18181b" }}
      handleIndicatorStyle={{ backgroundColor: "#71717a" }}
      onChange={sheetState.handleSheetChange}
    >
      <BottomSheetView className="flex-1 px-4 pb-8">
        {renderContent()}
      </BottomSheetView>
    </BottomSheet>
  );
}
