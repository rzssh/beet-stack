import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import * as React from "react";
import { View } from "react-native";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { RiderStatusDisplay, RideRating } from "~/components/ride";
import { Text } from "~/components/ui";
import { useBottomSheetState } from "~/hooks/useBottomSheetState";
import { useAuth } from "~/lib/hooks";
import { RecentDestination } from "~/stores/recent-destinations-store";

import { CollapsedContent } from "./CollapsedContent";
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

  const expandedContentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [0, 0.3, 1], [0, 0, 1]);
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
        <CollapsedContent onInputPress={handleInputPress} />

        <Animated.View style={expandedContentStyle} className="gap-4">
          <Text className="font-semibold text-white text-lg">
            Glad to see you back!
          </Text>

          <ServiceSelector
            selectedService={selectedService}
            onServiceSelect={handleServiceSelect}
            animatedIndex={animatedIndex}
          />

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
