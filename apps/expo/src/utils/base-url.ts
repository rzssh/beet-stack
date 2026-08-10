import Constants from "expo-constants";

const developmentHost = () => {
  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  if (!host)
    throw new Error(
      "Set EXPO_PUBLIC_API_URL when Expo cannot detect the development host",
    );
  return `http://${host}:3001`;
};

export const getApiUrl = () =>
  process.env.EXPO_PUBLIC_API_URL ?? developmentHost();
