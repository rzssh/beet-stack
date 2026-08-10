import { expoClient } from "@better-auth/expo/client";
import type { BetterAuthClientPlugin } from "better-auth";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { getApiUrl } from "./base-url";

const plugin = expoClient({
  scheme: "beet-stack",
  storagePrefix: "beet-stack",
  storage: SecureStore,
});

export const authClient = createAuthClient({
  baseURL: getApiUrl(),
  plugins: [plugin as unknown as BetterAuthClientPlugin],
}) as unknown as ReturnType<typeof createAuthClient> & {
  getCookie: () => string;
};
