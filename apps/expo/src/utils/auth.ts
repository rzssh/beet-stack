import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

/**
 * Auth client for Expo
 *
 * Uses local dev server URL which has oAuthProxy configured to handle OAuth flows.
 * The local server proxies OAuth through production (where callbacks are registered).
 */
export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_APP_URL,
  plugins: [
    expoClient({
      scheme: "expo",
      storagePrefix: "expo",
      storage: SecureStore,
    }),
  ],
});
