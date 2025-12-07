import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface CenterButtonProps {
  visible: boolean;
  onPress: () => void;
  bottomOffset?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CenterButton({
  visible,
  onPress,
  bottomOffset = 200,
}: CenterButtonProps) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(visible ? 1 : 0),
      transform: [{ scale: withSpring(visible ? 1 : 0.8) }],
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[
        {
          position: "absolute",
          right: 16,
          bottom: bottomOffset + 16,
          zIndex: 20,
        },
        animatedStyle,
      ]}
      className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg active:bg-zinc-100"
    >
      <Ionicons name="locate" size={24} color="#18181b" />
    </AnimatedPressable>
  );
}
