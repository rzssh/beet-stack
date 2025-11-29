import { useForm } from "@tanstack/react-form";
import { router } from "expo-router";
import { useState } from "react";
import * as v from "valibot";

import type { SignupInput } from "~/lib/schema";
import { signupSchema } from "~/lib/schema";
import { authClient } from "~/utils/auth";

export function useSignupForm() {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignupInput>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);

      try {
        const result = await authClient.signUp.email(value);

        if (result.error) {
          setError(result.error.message ?? "Sign up failed");
          return;
        }

        router.replace("/");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Sign up failed");
      }
    },
    validators: {
      onChange: signupSchema,
    },
  });

  return { form, error };
}
