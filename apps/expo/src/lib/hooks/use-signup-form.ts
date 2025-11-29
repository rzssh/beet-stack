import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useRef } from "react";

import { authQueries } from "~/lib/api/auth";
import type { SignupInput } from "~/lib/schema";
import { signupSchema } from "~/lib/schema";
import { authClient } from "~/utils/auth";

export function useSignupForm() {
  const queryClient = useQueryClient();
  const errorRef = useRef<string | null>(null);

  const form = useForm<SignupInput>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value, formApi }) => {
      errorRef.current = null;

      try {
        const result = await authClient.signUp.email(value);

        if (result.error) {
          errorRef.current = result.error.message ?? "Sign up failed";
          formApi.setErrorMap({
            onSubmit: result.error.message ?? "Sign up failed",
          });
          return;
        }

        await queryClient.invalidateQueries({
          queryKey: authQueries.session().queryKey,
        });

        router.replace("/");
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "Sign up failed";
        errorRef.current = errorMsg;
        formApi.setErrorMap({
          onSubmit: errorMsg,
        });
      }
    },
    validators: {
      onBlur: signupSchema,
    },
  });

  return form;
}
