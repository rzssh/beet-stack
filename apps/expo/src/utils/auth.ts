import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { getMicroserviceUrl } from "./base-url";

const authBaseUrl = process.env.EXPO_PUBLIC_APP_URL ?? getMicroserviceUrl();

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
  plugins: [
    expoClient({
      scheme: "expo",
      storagePrefix: "expo",
      storage: SecureStore,
    }),
  ],
  fetchOptions: {
    onSuccess: () => {},
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  },
});
