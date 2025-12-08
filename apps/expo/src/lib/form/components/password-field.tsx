import { AntDesign } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, type TextInputProps, useColorScheme, View } from "react-native";

import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";

import { useFieldContext } from "../context";

interface PasswordFieldProps extends Omit<TextInputProps, "value" | "onChangeText" | "secureTextEntry"> {
  label: string;
}

export function PasswordField({ label, className, ...props }: PasswordFieldProps) {
  const field = useFieldContext<string>();
  const [showPassword, setShowPassword] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#a1a1aa" : "#52525b";

  const errors = field.state.meta.errors;
  const hasError = errors.length > 0;
  const shouldShowError = hasError && field.state.meta.isTouched;

  return (
    <View className="w-full gap-2">
      <Text className="text-foreground text-sm font-medium">{label}</Text>
      <View className="relative w-full flex-row items-center">
        <Input
          nativeID={field.name}
          aria-labelledby={`label-${field.name}`}
          value={field.state.value ?? ""}
          onChangeText={field.handleChange}
          onBlur={field.handleBlur}
          aria-invalid={shouldShowError}
          secureTextEntry={!showPassword}
          className={cn(shouldShowError && "border-destructive", "flex-1 pr-14", className)}
          {...props}
        />
        <Pressable
          onPress={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-4 z-10 w-10 items-center justify-center"
          hitSlop={8}
        >
          <AntDesign name={showPassword ? "eye" : "eye-invisible"} size={20} color={iconColor} />
        </Pressable>
      </View>
      {shouldShowError
        ? errors.map((err) => {
            const message =
              typeof err === "string"
                ? err
                : ((err as { message?: string })?.message ?? "Validation error");
            return (
              <Text key={message} className="text-destructive text-sm" role="alert">
                {message}
              </Text>
            );
          })
        : null}
    </View>
  );
}
