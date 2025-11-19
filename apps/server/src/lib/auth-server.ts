import { db } from "@acme/db/client";
import { env } from "@acme/config";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";

const configuredOrigins = env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter((value): value is string => value.length > 0);

const fallbackOrigins = [env.FRONTEND_URL, env.BACKEND_URL].filter(
  (origin): origin is string => Boolean(origin),
);

const trustedOrigins: string[] =
  (configuredOrigins?.length ?? 0) > 0
    ? (configuredOrigins ?? [])
    : fallbackOrigins;

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  socialProviders:
    env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
          },
        }
      : undefined,
  plugins: [openAPI()],
  emailAndPassword: {
    enabled: true,
    password: {
      hash: (input: string) => Bun.password.hash(input),
      verify: ({ password, hash }) => Bun.password.verify(password, hash),
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // Cache for 5 minutes
    },
  },
  trustedOrigins,
});

export type Session = typeof auth.$Infer.Session;
