import Constants from "expo-constants";

/**
 * Get the base URL for all API and auth requests
 * - Development: Auto-detects local dev server IP
 * - Production: Uses EXPO_PUBLIC_APP_URL
 */
export const getLocalhost = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(":")[0];

  if (!localhost) {
    throw new Error("Failed to get localhost.");
  }

  return localhost;
};

export const getBaseUrl = () => {
  const localhost = getLocalhost();
  return `http://${localhost}:3000`;
};

export const getMicroserviceUrl = () => {
  const localhost = getLocalhost();
  return `http://${localhost}:3001`;
};
