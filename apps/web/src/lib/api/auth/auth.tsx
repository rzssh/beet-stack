import type { MutationOptions } from "@tanstack/react-query";
import { authClient } from "~/lib/auth/client";

export type SignInCredentials = {
  email: string;
  password: string;
  callbackURL?: string;
};

export type SignUpCredentials = {
  email: string;
  password: string;
  name: string;
  callbackURL?: string;
};

export const emailSignInMutationOptions: MutationOptions<
  unknown,
  Error,
  SignInCredentials
> = {
  mutationKey: ["auth", "signin"],
  mutationFn: async (credentials) => {
    const response = await authClient.signIn.email(credentials);
    if (response.error) throw new Error(response.error.message);
    return response.data;
  },
};

export const emailSignUpMutationOptions: MutationOptions<
  unknown,
  Error,
  SignUpCredentials
> = {
  mutationKey: ["auth", "signup"],
  mutationFn: async (credentials) => {
    const response = await authClient.signUp.email(credentials);
    if (response.error) throw new Error(response.error.message);
    return response.data;
  },
};
