import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "taxi-app",
  slug: "taxi-app",
  scheme: "expo",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/icon-light.png",
  userInterfaceStyle: "automatic",

  // EAS-related
  extra: {
    eas: {
      projectId: "42f03b18-b022-49e3-8285-41b4eb1ff4c2",
    },
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  owner: "r4zen2k",

  updates: {
    fallbackToCacheTimeout: 0,
  },
  newArchEnabled: true,
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "your.bundle.identifier",
    supportsTablet: true,
    icon: {
      light: "./assets/icon-light.png",
      dark: "./assets/icon-dark.png",
    },
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
  },
  android: {
    package: "your.bundle.identifier",
    adaptiveIcon: {
      foregroundImage: "./assets/icon-light.png",
      backgroundColor: "#1F104A",
    },
    edgeToEdgeEnabled: true,
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
    reactCanary: true,
    reactCompiler: true,
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-web-browser",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#E4E4E7",
        image: "./assets/icon-light.png",
        dark: {
          backgroundColor: "#18181B",
          image: "./assets/icon-dark.png",
        },
      },
    ],
    // [
    //   "expo-location",
    //   {
    //     locationWhenInUsePermission: "Show current location on map.",
    //   },
    // ],
    // [
    //   "@rnmapbox/maps",
    //   {
    //     RNMapboxMapsVersion: "11.13.4",
    //   },
    // ],
  ],
});
