import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useRef } from "react";

import { authQueries } from "~/lib/api/auth";
import type { LoginInput } from "~/lib/schema";
import { loginSchema } from "~/lib/schema";
import { authClient } from "~/utils/auth";

export function useLoginForm() {
  const queryClient = useQueryClient();
  const errorRef = useRef<string | null>(null);

  const form = useForm<LoginInput>({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value, formApi }) => {
      errorRef.current = null;

      try {
        const result = await authClient.signIn.email(value);

        if (result.error) {
          errorRef.current = result.error.message ?? "Login failed";
          formApi.setErrorMap({
            onSubmit: result.error.message ?? "Login failed",
          });
          return;
        }

        await queryClient.invalidateQueries({
          queryKey: authQueries.session().queryKey,
        });

        router.replace("/");
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "Login failed";
        errorRef.current = errorMsg;
        formApi.setErrorMap({
          onSubmit: errorMsg,
        });
      }
    },
    validators: {
      onBlur: loginSchema,
    },
  });

  return form;
}
