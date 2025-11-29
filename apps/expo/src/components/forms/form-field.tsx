import type { FieldApi } from "@tanstack/react-form";
import { View } from "react-native";

import { Label, Text } from "~/components/ui";

interface FormFieldProps<
  TParentData,
  TName extends string,
  TFieldValidator,
  TFormValidator,
  TData,
> {
  field: FieldApi<TParentData, TName, TFieldValidator, TFormValidator, TData>;
  label?: string;
  children: (
    field: FieldApi<TParentData, TName, TFieldValidator, TFormValidator, TData>,
  ) => React.ReactNode;
}

export function FormField<
  TParentData,
  TName extends string,
  TFieldValidator,
  TFormValidator,
  TData,
>({ field, label, children }: FormFieldProps<TParentData, TName, TFieldValidator, TFormValidator, TData>) {
  const errors = field.state.meta.errors;

  return (
    <View className="gap-2">
      {label && <Label nativeID={`label-${field.name}`}>{label}</Label>}
      {children(field)}
      {errors.length > 0 && (
        <Text className="text-destructive text-sm">{errors[0]}</Text>
      )}
    </View>
  );
}
