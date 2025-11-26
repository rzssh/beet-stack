import { authDb } from "@acme/db/client";
import { expo } from "@better-auth/expo";
import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy, openAPI } from "better-auth/plugins";
import { env } from "~/env";

// Use oAuthProxy when AUTH_DATABASE_URL is set (production OAuth with local dev)
const useOAuthProxy = env.NODE_ENV === "development" && !!env.AUTH_DATABASE_URL;

export function initAuth<
  TExtraPlugins extends BetterAuthPlugin[] = [],
>(options: {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;

  providers?: {
    discord?: { clientId?: string; clientSecret?: string };
  };
  extraPlugins?: TExtraPlugins;
}) {
  const { discord } = options.providers ?? {};
  const oauthCallbackBase = useOAuthProxy ? options.productionUrl : options.baseUrl;

  const config = {
    database: drizzleAdapter(authDb, { provider: "pg" }),
    baseURL: options.baseUrl,
    secret: options.secret,
    emailAndPassword: {
      enabled: true,
      password: {
        hash: (input: string) => Bun.password.hash(input),
        verify: ({ password, hash }) => Bun.password.verify(password, hash),
      },
    },
    plugins: [
      openAPI(),
      ...(useOAuthProxy ? [oAuthProxy({ productionURL: options.productionUrl })] : []),
      expo(),
      ...(options.extraPlugins ?? []),
    ],
    socialProviders: {
      ...(discord?.clientId &&
        discord.clientSecret && {
          discord: {
            clientId: discord.clientId,
            clientSecret: discord.clientSecret,
            redirectURI: `${oauthCallbackBase}/api/auth/callback/discord`,
          },
        }),
    },
    trustedOrigins: env.TRUSTED_ORIGINS,
    account: {
      accountLinking: {
        enabled: true,
        allowDifferentEmails: true,
        trustedProviders: ["google", "microsoft", "discord"],
      },
      // Skip cookie check in local dev - state verified via DB, cookies fail across localhost/IP
      skipStateCookieCheck: !useOAuthProxy && env.NODE_ENV === "development",
    },
    advanced: {
      crossSubDomainCookies: { enabled: true },
    },
    session: {
      cookieCache: { enabled: true, maxAge: 60 * 60 * 24 * 30 },
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24 * 3,
    },
    logger: {
      disabled: env.NODE_ENV === "production",
      level: env.NODE_ENV === "development" ? "debug" : "info",
    },
    onAPIError: {
      onError(error) {
        console.error("[Auth] API Error:", error instanceof Error ? error.message : error);
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
