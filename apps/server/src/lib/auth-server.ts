import { createAuth } from "@acme/auth";
import { env } from "@acme/config";

const configuredOrigins = env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter((value): value is string => value.length > 0) ?? [];

const fallbackOrigins = [env.FRONTEND_URL, env.BACKEND_URL].filter(
  (origin): origin is string => Boolean(origin),
);

const trustedOrigins = configuredOrigins.length > 0 ? configuredOrigins : fallbackOrigins;

export const auth = createAuth({
  baseUrl: env.BACKEND_URL,
  secret: env.BETTER_AUTH_SECRET ?? "",
  discordClientId: env.DISCORD_CLIENT_ID,
  discordClientSecret: env.DISCORD_CLIENT_SECRET,
  githubClientId: env.GITHUB_CLIENT_ID,
  githubClientSecret: env.GITHUB_CLIENT_SECRET,
  trustedOrigins,
});

export type { Session } from "@acme/auth/types";
