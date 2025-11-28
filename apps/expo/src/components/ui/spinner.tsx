import * as React from "react";
import { ActivityIndicator, View } from "react-native";

import { cn } from "~/lib/utils";
import { Text } from "~/components/ui/text";

interface SpinnerProps {
  size?: "small" | "large";
  color?: string;
  className?: string;
  label?: string;
}

function Spinner({ size = "large", color = "#c03484", className, label }: SpinnerProps) {
  return (
    <View className={cn("items-center justify-center gap-3", className)}>
      <ActivityIndicator size={size} color={color} />
      {label && <Text className="text-muted-foreground">{label}</Text>}
    </View>
  );
}

interface LoadingScreenProps {
  label?: string;
}

function LoadingScreen({ label = "Loading..." }: LoadingScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Spinner label={label} />
    </View>
  );
}

export { Spinner, LoadingScreen };
export type { SpinnerProps, LoadingScreenProps };
