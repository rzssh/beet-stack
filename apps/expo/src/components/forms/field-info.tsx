import type { AnyFieldApi } from "@tanstack/react-form";
import { Text } from "~/components/ui";

export function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid
        ? field.state.meta.errors.map((err) => (
            <Text key={err.message} className="text-destructive text-sm">
              {err.message}
            </Text>
          ))
        : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}
