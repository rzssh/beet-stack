import * as React from "react";
import { View } from "react-native";
import { SharedValue } from "react-native-reanimated";

import { RecentDestination } from "~/stores/recent-destinations-store";

import { RecentDestinations } from "./RecentDestinations";
import { ServiceSelector } from "./ServiceSelector";

interface MediumContentProps {
  onInputPress: () => void;
  onDestinationSelect: (destination: RecentDestination) => void;
  selectedService: string;
  onServiceSelect: (serviceId: string) => void;
  animatedIndex: SharedValue<number>;
}

export function MediumContent({
  onInputPress,
  onDestinationSelect,
  selectedService,
  onServiceSelect,
  animatedIndex,
}: MediumContentProps) {
  return (
    <View className="gap-6">
      <ServiceSelector
        selectedService={selectedService}
        onServiceSelect={onServiceSelect}
        animatedIndex={animatedIndex}
      />

      <RecentDestinations
        onSelect={onDestinationSelect}
        animatedIndex={animatedIndex}
      />
    </View>
  );
}
