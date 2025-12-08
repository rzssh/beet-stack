import { createFormHook } from "@tanstack/react-form";

import { EmailField, FormError, PasswordField, SubmitButton, TextField } from "./components";
import { fieldContext, formContext, useFieldContext, useFormContext } from "./context";

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    PasswordField,
    EmailField,
  },
  formComponents: {
    SubmitButton,
    FormError,
  },
});

export { useFieldContext, useFormContext };
