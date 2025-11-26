import Constants from "expo-constants";

/**
 * Get the base URL for all API and auth requests
 * - Development: Auto-detects local dev server IP
 * - Production: Uses EXPO_PUBLIC_APP_URL
 */
export const getBaseUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(":")[0];

  if (!localhost) {
    throw new Error("Failed to get localhost. Please set EXPO_PUBLIC_APP_URL.");
  }

  return `http://${localhost}:3000`;
};
