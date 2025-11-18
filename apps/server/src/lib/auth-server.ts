import { db } from "@acme/db/client";
import { betterAuth, env } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";

const configuredOrigins = env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter((value): value is string => value.length > 0);

const fallbackOrigins = [env.FRONTEND_URL, env.BACKEND_URL].filter(
  (origin): origin is string => Boolean(origin),
);

const trustedOrigins: string[] =
  configuredOrigins && configuredOrigins.length > 0
    ? configuredOrigins
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
  trustedOrigins,
});

export type Session = typeof auth.$Infer.Session;
