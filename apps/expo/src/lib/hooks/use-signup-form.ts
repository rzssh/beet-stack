import { revalidateLogic } from "@tanstack/react-form";
import { router } from "expo-router";

import { authClient } from "~/lib/auth";
import { useAppForm } from "~/lib/form";
import { signupSchema } from "~/lib/schema";

export function useSignupForm() {
  return useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onChange: signupSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await authClient.signUp.email(value);

      if (result.error) {
        throw new Error(result.error.message ?? "Sign up failed");
      }

      router.replace("/");
    },
  });
}
