import { createAuthClient } from "better-auth/react";

const resolveBaseUrl = () => {
  const metaEnv = (import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  }).env;

  if (metaEnv?.VITE_API_URL) {
    return metaEnv.VITE_API_URL;
  }

  if (typeof process !== "undefined" && process.env?.API_URL) {
    return process.env.API_URL;
  }

  return "http://localhost:3001";
};

const authClientRepo = createAuthClient({
  baseURL: resolveBaseUrl(),
  fetchOptions: {
    credentials: "include",
    mode: "cors",
  },
});

export { authClientRepo };
