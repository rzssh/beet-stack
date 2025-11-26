import Constants from "expo-constants";

export const getLocalhost = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(":")[0];
  if (!localhost) throw new Error("Failed to get localhost.");
  return localhost;
};

export const getBaseUrl = () => `http://${getLocalhost()}:3000`;

export const getMicroserviceUrl = () => `http://${getLocalhost()}:3001`;
