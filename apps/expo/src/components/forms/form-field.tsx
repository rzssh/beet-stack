import type { AnyFieldApi } from "@tanstack/react-form";
import { View } from "react-native";

import { Label, Text } from "~/components/ui";

interface FormFieldProps {
  field: AnyFieldApi;
  label?: string;
  children: React.ReactNode;
}

export function FormField({ field, label, children }: FormFieldProps) {
  const errors = field.state.meta.errors;
  const hasError = errors.length > 0;
  const shouldDisplayError = hasError && field.state.meta.isTouched;

  return (
    <View className="w-full gap-2">
      {label && <Label nativeID={`label-${field.name}`}>{label}</Label>}
      {children}
      {shouldDisplayError
        ? errors.map((err) => {
            const message =
              typeof err === "string"
                ? err
                : ((err as { message?: string })?.message ??
                  "Validation error");
            return (
              <Text
                key={message}
                className="text-destructive text-sm"
                role="alert"
              >
                {message}
              </Text>
            );
          })
        : null}
    </View>
  );
}
