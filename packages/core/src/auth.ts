import { db } from "@beet/db/client";
import { expo } from "@better-auth/expo";
import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "./env";

export function initAuth(options: {
  baseUrl: string;
  secret: string;
  extraPlugins?: BetterAuthPlugin[];
}) {
  const config = {
    database: drizzleAdapter(db, { provider: "pg" }),
    baseURL: options.baseUrl,
    secret: options.secret,
    emailAndPassword: { enabled: true },
    plugins: [expo(), ...(options.extraPlugins ?? [])],
    trustedOrigins: [
      ...env.TRUSTED_ORIGINS,
      ...(env.NODE_ENV === "development"
        ? [
            "exp://",
            "exp://**",
            "exp://192.168.*.*:*/**",
            "exp://10.*.*.*:*/**",
          ]
        : []),
    ],
    session: {
      cookieCache: { enabled: true, maxAge: 60 * 5 },
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
