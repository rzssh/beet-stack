import { db } from "@acme/db/client";
import { expo } from "@better-auth/expo";
import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy, openAPI } from "better-auth/plugins";
import { env } from "~/env";

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

  const config = {
    database: drizzleAdapter(db, { provider: "pg" }),
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
      // /api/auth/reference
      openAPI(),
      oAuthProxy({ productionURL: options.productionUrl }),
      expo(),
      ...(options.extraPlugins ?? []),
    ],
    socialProviders: {
      ...(discord?.clientId &&
        discord.clientSecret && {
          discord: {
            clientId: discord.clientId,
            clientSecret: discord.clientSecret,
            redirectURI: `${options.productionUrl}/api/auth/callback/discord`,
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
    },
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
      },
      useSecureCookies: false,
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      },
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24 * 3, // 1 day (every 1 day the session expiration is updated)
    },
    onAPIError: {
      onError(error, ctx) {
        console.error("BETTER AUTH API ERROR", error, ctx);
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
