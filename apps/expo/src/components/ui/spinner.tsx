import { ActivityIndicator, type ActivityIndicatorProps, View } from "react-native";

import { Text } from "./text";

interface SpinnerProps extends ActivityIndicatorProps {
  label?: string;
}

export function Spinner({ label, size = "small", color, ...props }: SpinnerProps) {
  if (label) {
    return (
      <View className="flex-1 items-center justify-center gap-3">
        <ActivityIndicator size={size} color={color} {...props} />
        <Text className="text-muted-foreground">{label}</Text>
      </View>
    );
  }

  return <ActivityIndicator size={size} color={color} {...props} />;
}
