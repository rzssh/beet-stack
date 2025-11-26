import { env } from "@acme/core/env";

export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`;
  }

  if (env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${env.RAILWAY_PUBLIC_DOMAIN}`;
  }

  if (env.FLY_APP_NAME) {
    return `https://${env.FLY_APP_NAME}.fly.dev`;
  }

  return env.APP_URL;
}
