import { Keyboard, Pressable, View } from "react-native";
import { useColorScheme } from "nativewind";

import { Text } from "./text";

export function InputAccessory() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: isDark ? "#1c1c1e" : "#d1d5db",
        borderTopWidth: 0.5,
        borderTopColor: isDark ? "#3a3a3c" : "#9ca3af",
      }}
    >
      <Pressable
        onPress={() => Keyboard.dismiss()}
        hitSlop={8}
        style={({ pressed }) => ({
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 6,
          backgroundColor: pressed
            ? isDark ? "#3a3a3c" : "#9ca3af"
            : isDark ? "#2c2c2e" : "#e5e7eb",
        })}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: isDark ? "#0a84ff" : "#007aff",
          }}
        >
          Done
        </Text>
      </Pressable>
    </View>
  );
}
