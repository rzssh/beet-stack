import { View } from "react-native";

import { Text } from "../text";

interface FieldWrapperProps {
  label: string;
  fieldId: string;
  children: React.ReactNode;
  error?: React.ReactNode;
}

export function FieldWrapper({
  label,
  fieldId,
  children,
  error,
}: FieldWrapperProps) {
  return (
    <View className="w-full gap-2">
      <Text
        nativeID={`label-${fieldId}`}
        className="font-medium text-foreground text-sm"
      >
        {label}
      </Text>
      {children}
      {error}
    </View>
  );
}
