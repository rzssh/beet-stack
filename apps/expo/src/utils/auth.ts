import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

/**
 * Auth client for Expo
 *
 * Uses production URL for authentication because OAuth callbacks must be registered
 * with a fixed URL (production). The user will be synced to local DB on first
 * authenticated API request (see auth middleware in @acme/core).
 *
 * For API calls, use the api client which points to localhost in development.
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
