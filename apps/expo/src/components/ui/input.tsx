import { AntDesign } from "@expo/vector-icons";
import type { AnyFieldApi } from "@tanstack/react-form";
import { forwardRef, useCallback, useMemo, useState } from "react";
import {
  I18nManager,
  TextInput as NTextInput,
  Pressable,
  StyleSheet,
  type TextInput,
  type TextInputProps,
  useColorScheme,
  View,
} from "react-native";
import { tv } from "tailwind-variants";
import { cn } from "~/lib/utils";

import { Text } from "./text";

const inputTv = tv({
  slots: {
    container: "mb-2",
    label: "text-grey-100 mb-1 text-lg dark:text-neutral-100",
    input:
      "mt-0 rounded-xl border-[0.5px] border-neutral-300 bg-neutral-100 px-4 py-3 font-inter text-base font-medium leading-5 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white",
  },

  variants: {
    focused: {
      true: {
        input: "border-neutral-400 dark:border-neutral-300",
      },
    },
    error: {
      true: {
        input: "border-danger-600",
        label: "text-danger-600 dark:text-danger-600",
      },
    },
    disabled: {
      true: {
        input: "bg-neutral-200",
      },
    },
  },
  defaultVariants: {
    focused: false,
    error: false,
    disabled: false,
  },
});

export interface NInputProps extends TextInputProps {
  label?: string;
  disabled?: boolean;
  error?: string;
}

export const Input = forwardRef<NTextInput, NInputProps>((props, ref) => {
  const { label, error, testID, ...inputProps } = props;
  const [isFocussed, setIsFocussed] = useState(false);
  const onBlur = useCallback(() => setIsFocussed(false), []);
  const onFocus = useCallback(() => setIsFocussed(true), []);

  const styles = useMemo(
    () =>
      inputTv({
        error: Boolean(error),
        focused: isFocussed,
        disabled: Boolean(props.disabled),
      }),
    [error, isFocussed, props.disabled],
  );

  return (
    <View className={styles.container()}>
      {label && (
        <Text
          testID={testID ? `${testID}-label` : undefined}
          className={styles.label()}
        >
          {label}
        </Text>
      )}
      <NTextInput
        testID={testID}
        ref={ref}
        className={styles.input()}
        onBlur={onBlur}
        onFocus={onFocus}
        {...inputProps}
        style={StyleSheet.flatten([
          { writingDirection: I18nManager.isRTL ? "rtl" : "ltr" },
          { textAlign: I18nManager.isRTL ? "right" : "left" },
          inputProps.style,
        ])}
      />
      {error && (
        <Text
          testID={testID ? `${testID}-error` : undefined}
          className="text-danger-400 text-sm dark:text-danger-600"
        >
          {error}
        </Text>
      )}
    </View>
  );
});

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
