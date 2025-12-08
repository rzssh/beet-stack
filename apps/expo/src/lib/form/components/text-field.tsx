import type { TextInputProps } from "react-native";
import { View } from "react-native";

import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";

import { useFieldContext } from "../context";

interface TextFieldProps extends Omit<TextInputProps, "value" | "onChangeText"> {
  label: string;
}

export function TextField({ label, className, ...props }: TextFieldProps) {
  const field = useFieldContext<string>();
  const errors = field.state.meta.errors;
  const hasError = errors.length > 0;
  const shouldShowError = hasError && field.state.meta.isTouched;

  return (
    <View className="w-full gap-2">
      <Text className="text-foreground text-sm font-medium">{label}</Text>
      <Input
        nativeID={field.name}
        aria-labelledby={`label-${field.name}`}
        value={field.state.value ?? ""}
        onChangeText={field.handleChange}
        onBlur={field.handleBlur}
        aria-invalid={shouldShowError}
        className={cn(shouldShowError && "border-destructive", className)}
        {...props}
      />
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
