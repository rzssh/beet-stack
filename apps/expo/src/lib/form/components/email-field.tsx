import type { TextInputProps } from "react-native";

import { FieldError, FieldWrapper } from "~/components/ui/forms";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

import { useFieldContext } from "../context";
import { useFieldState } from "../hooks";

interface EmailFieldProps extends Omit<TextInputProps, "value" | "onChangeText" | "keyboardType" | "autoCapitalize" | "autoComplete"> {
  label: string;
}

export function EmailField({ label, className, ...props }: EmailFieldProps) {
  const field = useFieldContext<string>();
  const { showError, errorMessages } = useFieldState(field);

  return (
    <FieldWrapper
      label={label}
      fieldId={field.name}
      error={<FieldError errors={errorMessages} show={showError} />}
    >
      <Input
        nativeID={field.name}
        aria-labelledby={`label-${field.name}`}
        value={field.state.value ?? ""}
        onChangeText={field.handleChange}
        onBlur={field.handleBlur}
        aria-invalid={showError}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        className={cn(showError && "border-destructive", className)}
        {...props}
      />
    </FieldWrapper>
  );
}
