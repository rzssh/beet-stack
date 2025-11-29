import { useForm } from "@tanstack/react-form";
import { router } from "expo-router";
import { useState } from "react";

import type { LoginInput } from "~/lib/schema";
import { loginSchema } from "~/lib/schema";
import { authClient } from "~/utils/auth";

export function useLoginForm() {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);

      try {
        const result = await authClient.signIn.email(value);

        if (result.error) {
          setError(result.error.message ?? "Login failed");
          return;
        }

        router.replace("/");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Login failed");
      }
    },
    validators: {
      onChange: loginSchema,
    },
  });

  return { form, error };
}
