import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as React from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "~/components/ui";
import { useAuth } from "~/lib/hooks";
import { useDrawerStore } from "~/stores/drawer-store";

import { DrawerHeader } from "./DrawerHeader";
import { DrawerMenuItem } from "./DrawerMenuItem";
import { OtherAppsSection } from "./OtherAppsSection";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_WIDTH * 0.85;

export function AppDrawer() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const isOpen = useDrawerStore((s) => s.isOpen);
  const close = useDrawerStore((s) => s.close);
  const [isVisible, setIsVisible] = React.useState(false);

  const translateX = useSharedValue(-DRAWER_WIDTH);
  const backdropOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      translateX.value = withTiming(0, { duration: 300 });
      backdropOpacity.value = withTiming(0.5, { duration: 300 });
    } else {
      translateX.value = withTiming(-DRAWER_WIDTH, { duration: 250 }, (finished) => {
        if (finished) {
          runOnJS(setIsVisible)(false);
        }
      });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [isOpen, translateX, backdropOpacity]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = event.translationX;
        backdropOpacity.value = interpolate(
          event.translationX,
          [-DRAWER_WIDTH, 0],
          [0, 0.5]
        );
      }
    })
    .onEnd((event) => {
      if (event.translationX < -DRAWER_WIDTH * 0.3 || event.velocityX < -500) {
        translateX.value = withTiming(-DRAWER_WIDTH, { duration: 200 });
        backdropOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(close)();
      } else {
        translateX.value = withTiming(0, { duration: 200 });
        backdropOpacity.value = withTiming(0.5, { duration: 200 });
      }
    });

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleNavigate = (path: string) => {
    close();
    router.push(path as any);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[StyleSheet.absoluteFill, backdropStyle, { backgroundColor: "#000" }]}
      >
        <Pressable onPress={close} style={{ flex: 1 }} />
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            drawerStyle,
            {
              width: DRAWER_WIDTH,
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              backgroundColor: "#18181b",
            },
          ]}
        >
          <View style={{ paddingTop: insets.top, flex: 1 }}>
            <View className="flex-row items-center justify-end px-4 py-2">
              <Pressable
                onPress={close}
                className="h-10 w-10 items-center justify-center rounded-full bg-zinc-800"
              >
                <Ionicons name="close" size={22} color="#fff" />
              </Pressable>
            </View>

            <DrawerHeader />

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <View className="py-2">
                <DrawerMenuItem
                  icon="card-outline"
                  label="Payment"
                  onPress={() => handleNavigate("/(tabs)/profile/billing")}
                />
                <DrawerMenuItem
                  icon="ribbon-outline"
                  label="Subscriptions"
                  onPress={() => {}}
                />
                <DrawerMenuItem
                  icon="time-outline"
                  label="Ride History"
                  onPress={() => handleNavigate("/(tabs)/rides")}
                />
                <DrawerMenuItem
                  icon="shield-checkmark-outline"
                  label="Safety"
                  onPress={() => {}}
                />
                <DrawerMenuItem
                  icon="help-circle-outline"
                  label="Support"
                  onPress={() => {}}
                />
                <DrawerMenuItem
                  icon="information-circle-outline"
                  label="About"
                  onPress={() => {}}
                />
              </View>

              <OtherAppsSection />
            </ScrollView>

            {isAuthenticated && (
              <View
                style={{ paddingBottom: insets.bottom + 16 }}
                className="border-t border-zinc-800 px-5 pt-4"
              >
                <Button
                  onPress={() => handleNavigate("/(tabs)/profile/driver-registration")}
                  className="w-full"
                >
                  <Text className="font-semibold">Become a Driver</Text>
                </Button>
              </View>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
