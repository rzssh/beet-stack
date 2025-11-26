import { authDb } from "@acme/db/client";
import { expo } from "@better-auth/expo";
import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy, openAPI } from "better-auth/plugins";
import { env } from "~/env";

/**
 * Whether to use OAuth proxy for cross-origin OAuth flows.
 *
 * When AUTH_DATABASE_URL is set, we use production callbacks with oAuthProxy
 * for OAuth providers that only support a single callback URL.
 *
 * When not set, we use baseUrl callbacks (requires registering localhost
 * in OAuth provider, or provider supports multiple callback URLs).
 */
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

  // Use production callbacks when oAuthProxy is enabled, otherwise use baseUrl
  const oauthCallbackBase = useOAuthProxy
    ? options.productionUrl
    : options.baseUrl;

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
      openAPI(), // /api/auth/reference
      // Only use oAuthProxy when AUTH_DATABASE_URL is configured for shared state
      ...(useOAuthProxy
        ? [oAuthProxy({ productionURL: options.productionUrl })]
        : []),
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
      // Skip state cookie check in local-only dev mode (no AUTH_DATABASE_URL)
      // State is verified via database; cookie check fails when localhost !== APP_URL
      skipStateCookieCheck: !useOAuthProxy && env.NODE_ENV === "development",
    },
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
      },
      // useSecureCookies: false,
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      },
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24 * 3, // 3 days
    },
    logger: {
      disabled: env.NODE_ENV === "production",
      level: env.NODE_ENV === "development" ? "debug" : "info",
    },
    onAPIError: {
      onError(error) {
        console.error("[Auth] API Error", {
          message: error instanceof Error ? error.message : String(error),
        });
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
