import { AntDesign } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, type TextInputProps, useColorScheme, View } from "react-native";

import { FieldError, FieldWrapper } from "~/components/ui/forms";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

import { useFieldContext } from "../context";
import { useFieldState } from "../hooks";

interface PasswordFieldProps extends Omit<TextInputProps, "value" | "onChangeText" | "secureTextEntry"> {
  label: string;
}

export function PasswordField({ label, className, ...props }: PasswordFieldProps) {
  const field = useFieldContext<string>();
  const [showPassword, setShowPassword] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#a1a1aa" : "#52525b";
  const { showError, errorMessages } = useFieldState(field);

  return (
    <FieldWrapper
      label={label}
      fieldId={field.name}
      error={<FieldError errors={errorMessages} show={showError} />}
    >
      <View className="relative w-full flex-row items-center">
        <Input
          nativeID={field.name}
          aria-labelledby={`label-${field.name}`}
          value={field.state.value ?? ""}
          onChangeText={field.handleChange}
          onBlur={field.handleBlur}
          aria-invalid={showError}
          secureTextEntry={!showPassword}
          className={cn(showError && "border-destructive", "flex-1 pr-14", className)}
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
    </FieldWrapper>
  );
}
