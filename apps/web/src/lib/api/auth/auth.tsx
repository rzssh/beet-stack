import type { MutationOptions } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { authClient } from "~/lib/auth/client";

// Query keys
export const authKeys = {
  user: ["user"] as const,
  session: ["session"] as const,
};

// Types
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

export type SocialSignInCredentials = {
  provider: "discord" | "google" | "github";
  callbackURL?: string;
};

// Query options
export const userQueryOptions = queryOptions({
  queryKey: authKeys.user,
  queryFn: () => authClient.getSession(),
});

// Mutation options
export const emailSignInMutationOptions: MutationOptions<
  unknown,
  Error,
  SignInCredentials
> = {
  mutationKey: [...authKeys.user, "signin"],
  mutationFn: async (credentials: SignInCredentials) => {
    const res = await authClient.signIn.email(credentials);

    if (res.error) {
      throw new Error(res.error.message);
    }

    return res;
  },
};

export const emailSignUpMutationOptions: MutationOptions<
  unknown,
  Error,
  SignUpCredentials
> = {
  mutationKey: [...authKeys.user, "signup"],
  mutationFn: async (credentials: SignUpCredentials) => {
    return authClient.signUp.email(credentials);
  },
};

export const socialSignInMutationOptions: MutationOptions<
  string | null,
  Error,
  SocialSignInCredentials
> = {
  mutationKey: [...authKeys.user, "social-signin"],
  mutationFn: async (credentials: SocialSignInCredentials) => {
    const { data } = await authClient.signIn.social({
      provider: credentials.provider,
      callbackURL: credentials.callbackURL,
    });
    return data?.url ?? null;
  },
};

export const signOutMutationOptions: MutationOptions<unknown, Error, void> = {
  mutationKey: [...authKeys.user, "signout"],
  mutationFn: async () => {
    return authClient.signOut();
  },
};
