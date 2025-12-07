import { useForm } from "@tanstack/react-form";
import { router } from "expo-router";

import { signupSchema } from "~/lib/schema";
import { authClient } from "~/utils/auth";

export function useSignupForm() {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      const result = await authClient.signUp.email(value);

      if (result.error) {
        throw new Error(result.error.message ?? "Sign up failed");
      }

      router.replace("/");
    },
    validators: {
      onBlur: signupSchema,
    },
  });

  return form;
}
