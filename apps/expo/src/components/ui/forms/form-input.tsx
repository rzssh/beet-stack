import { AntDesign } from "@expo/vector-icons";
import type { AnyFieldApi } from "@tanstack/react-form";
import { useState } from "react";
import {
  Pressable,
  type TextInput,
  type TextInputProps,
  useColorScheme,
  View,
} from "react-native";

import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

type FormInputProps = Omit<TextInputProps, "value" | "defaultValue"> & {
  field: AnyFieldApi;
  withPasswordToggle?: boolean;
} & React.RefAttributes<TextInput>;

export const FormInput = ({
  field,
  className,
  withPasswordToggle,
  secureTextEntry,
  ...props
}: FormInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const hasError = field.state.meta.errors.length > 0;
  const shouldShowError = hasError && field.state.meta.isTouched;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#a1a1aa" : "#52525b";

  const isPasswordInput = withPasswordToggle || secureTextEntry;
  const actualSecureTextEntry = isPasswordInput && !showPassword;

  if (withPasswordToggle) {
    return (
      <View className="relative w-full flex-row items-center">
        <Input
          nativeID={field.name}
          aria-labelledby={`label-${field.name}`}
          value={field.state.value ?? ""}
          onChangeText={field.handleChange}
          onBlur={field.handleBlur}
          aria-invalid={shouldShowError}
          secureTextEntry={actualSecureTextEntry}
          className={cn(
            shouldShowError && "border-destructive",
            "flex-1 pr-14",
            className,
          )}
          {...props}
        />
        <Pressable
          onPress={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-4 z-10 w-10 items-center justify-center"
          hitSlop={8}
        >
          <AntDesign
            name={showPassword ? "eye" : "eye-invisible"}
            size={20}
            color={iconColor}
          />
        </Pressable>
      </View>
    );
  }

  return (
    <Input
      nativeID={field.name}
      aria-labelledby={`label-${field.name}`}
      value={field.state.value ?? ""}
      onChangeText={field.handleChange}
      onBlur={field.handleBlur}
      aria-invalid={shouldShowError}
      secureTextEntry={actualSecureTextEntry}
      className={cn(shouldShowError && "border-destructive", className)}
      {...props}
    />
  );
};
