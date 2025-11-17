import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { env } from "../config/env";
import { db } from "../database";

const trustedOrigins = env.BETTER_AUTH_TRUSTED_ORIGINS
  ? env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
  : [env.FRONTEND_URL];

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "postgres",
  }),
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
