import { createWebAuthClient } from "@acme/auth/client";

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

const authClientRepo = createWebAuthClient(resolveBaseUrl());

export { authClientRepo };
