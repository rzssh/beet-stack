import { createAuthClient } from "better-auth/react";
import type { Auth } from "./index";

export interface CreateAuthClientConfig {
  baseURL: string;
  plugins?: any[];
}

export function createAuthClientBase(config: CreateAuthClientConfig) {
  return createAuthClient({
    baseURL: config.baseURL,
    plugins: config.plugins ?? [],
  });
}

// For web usage
export function createWebAuthClient(baseURL: string) {
  return createAuthClientBase({ baseURL });
}

// For mobile usage  
export function createMobileAuthClient(baseURL: string, storage: any) {
  try {
    // Dynamic import to avoid bundling expo in web builds
    const { expo } = require("@better-auth/expo/client");
    return createAuthClientBase({
      baseURL,
      plugins: [
        expo({
          scheme: "expo",
          storagePrefix: "auth",
          storage,
        }),
      ],
    });
  } catch (error) {
    console.warn("Failed to load @better-auth/expo client:", error);
    // Fallback to base client without expo plugin
    return createAuthClientBase({ baseURL });
  }
}

export type AuthClient = ReturnType<typeof createAuthClientBase>;

// Export types for inference
export type SessionData = Awaited<ReturnType<Auth["api"]["getSession"]>>;
export type UserData = NonNullable<SessionData>["user"];