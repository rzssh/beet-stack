import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { Pressable, View } from "react-native";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import { Text } from "~/components/ui";
import { toast } from "~/utils/toast";

interface Service {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
}

const services: Service[] = [
  { id: "ride", label: "Ride", icon: "car", active: true },
  { id: "food", label: "Food", icon: "fast-food", active: false },
  { id: "carshare", label: "Carshare", icon: "key", active: false },
];

interface ServiceSelectorProps {
  selectedService: string;
  onServiceSelect: (serviceId: string) => void;
  animatedIndex: SharedValue<number>;
}

export function ServiceSelector({
  selectedService,
  onServiceSelect,
  animatedIndex,
}: ServiceSelectorProps) {
  const handleServicePress = (service: Service) => {
    if (!service.active) {
      toast.info(`${service.label} coming soon!`);
      return;
    }
    onServiceSelect(service.id);
  };

  return (
    <View className="flex-row gap-3">
      {services.map((service) => {
        const isSelected = selectedService === service.id;

        const animatedStyle = useAnimatedStyle(() => {
          const opacity = interpolate(
            animatedIndex.value,
            [0, 0.5, 1],
            [0, 0, 1]
          );
          const translateY = interpolate(
            animatedIndex.value,
            [0, 1],
            [10, 0]
          );
          return {
            opacity,
            transform: [{ translateY }],
          };
        });

        return (
          <Animated.View key={service.id} style={[animatedStyle, { flex: 1 }]}>
            <Pressable
              onPress={() => handleServicePress(service)}
              className={`items-center gap-2 rounded-xl border-2 p-4 ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : service.active
                    ? "border-zinc-700 bg-zinc-800"
                    : "border-zinc-700/50 bg-zinc-800/50"
              }`}
            >
              <View
                className={`h-12 w-12 items-center justify-center rounded-full ${
                  isSelected
                    ? "bg-primary"
                    : service.active
                      ? "bg-zinc-700"
                      : "bg-zinc-700/50"
                }`}
              >
                <Ionicons
                  name={service.icon}
                  size={24}
                  color={
                    isSelected ? "#fff" : service.active ? "#a1a1aa" : "#52525b"
                  }
                />
              </View>
              <Text
                className={
                  isSelected
                    ? "font-medium text-primary"
                    : service.active
                      ? "text-white"
                      : "text-zinc-500"
                }
              >
                {service.label}
              </Text>
              {!service.active && (
                <Text className="text-zinc-600 text-xs">Soon</Text>
              )}
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}
