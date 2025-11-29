import type { FieldApi } from "@tanstack/react-form";
import { forwardRef } from "react";
import type { TextInput, TextInputProps } from "react-native";

import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

interface FormInputProps<
  TParentData,
  TName extends string,
  TFieldValidator,
  TFormValidator,
  TData,
> extends Omit<TextInputProps, "value" | "onChangeText"> {
  field: FieldApi<TParentData, TName, TFieldValidator, TFormValidator, TData>;
}

function FormInputInner<
  TParentData,
  TName extends string,
  TFieldValidator,
  TFormValidator,
  TData,
>(
  {
    field,
    className,
    ...props
  }: FormInputProps<TParentData, TName, TFieldValidator, TFormValidator, TData>,
  ref: React.Ref<TextInput>,
) {
  const hasError = field.state.meta.errors.length > 0;

  return (
    <Input
      ref={ref}
      value={field.state.value ?? ""}
      onChangeText={(text) => field.handleChange(text)}
      onBlur={field.handleBlur}
      aria-invalid={hasError}
      className={cn(hasError && "border-destructive", className)}
      {...props}
    />
  );
}

export const FormInput = forwardRef(FormInputInner) as <
  TParentData,
  TName extends string,
  TFieldValidator,
  TFormValidator,
  TData,
>(
  props: FormInputProps<TParentData, TName, TFieldValidator, TFormValidator, TData> & {
    ref?: React.Ref<TextInput>;
  },
) => ReturnType<typeof FormInputInner>;
