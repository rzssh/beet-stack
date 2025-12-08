import type { AnyFieldApi } from "@tanstack/react-form";

import { parseErrors } from "../utils";

export function useFieldState(field: AnyFieldApi) {
  const errors = field.state.meta.errors;
  const hasError = errors.length > 0;
  const isTouched = field.state.meta.isTouched;
  const showError = hasError && isTouched;
  const errorMessages = parseErrors(errors);

  return { errors, hasError, isTouched, showError, errorMessages };
}
