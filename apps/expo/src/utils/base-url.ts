import Constants from "expo-constants";

/**
 * Get the base URL for the API server.
 * 
 * Supports multiple integration patterns:
 * 1. Standalone Elysia server (default): Auto-detects host IP and connects to port 3001
 * 2. Embedded Expo API routes: Falls back to current app's API routes
 * 3. Production: Use EXPO_PUBLIC_API_URL environment variable
 */
export const getBaseUrl = () => {
  // Production URL from environment variable
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Development: auto-detect host IP for Expo Go (standalone server)
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(":")[0];

  if (!localhost) {
    console.warn(
      "Failed to get localhost for standalone server. Falling back to embedded API routes. " +
      "Set EXPO_PUBLIC_API_URL for production or ensure Expo development server is running."
    );
    
    // Fallback to embedded API routes within the Expo app
    return "";
  }

  // Connect to standalone Elysia server on port 3001
  return `http://${localhost}:3001`;
};
