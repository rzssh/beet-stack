import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy, openAPI } from "better-auth/plugins";

import { db } from "@acme/db/client";

export interface AuthConfig {
  baseUrl: string;
  secret: string;
  discordClientId?: string;
  discordClientSecret?: string;
  githubClientId?: string;
  githubClientSecret?: string;
  trustedOrigins?: string[];
  enableExpoPlugin?: boolean;
  extraPlugins?: BetterAuthPlugin[];
}

export function createAuth(options: AuthConfig) {
  const plugins: BetterAuthPlugin[] = [
    openAPI(),
    oAuthProxy(),
    ...(options.extraPlugins ?? []),
  ];

  // Only load expo plugin if explicitly enabled
  if (options.enableExpoPlugin) {
    try {
      const { expo } = require("@better-auth/expo");
      plugins.push(expo());
    } catch (error) {
      console.warn("Failed to load @better-auth/expo plugin:", error);
    }
  }

  const config: BetterAuthOptions = {
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    baseURL: options.baseUrl,
    secret: options.secret,
    plugins,
    socialProviders: {},
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
    trustedOrigins: [
      "expo://",
      "exp://",
      options.baseUrl,
      ...(options.trustedOrigins ?? []),
    ],
    onAPIError: {
      onError(error, ctx) {
        console.error("BETTER AUTH API ERROR", error, ctx);
      },
    },
  };

  // Add Discord OAuth if credentials provided
  if (options.discordClientId && options.discordClientSecret) {
    config.socialProviders!.discord = {
      clientId: options.discordClientId,
      clientSecret: options.discordClientSecret,
    };
  }

  // Add GitHub OAuth if credentials provided  
  if (options.githubClientId && options.githubClientSecret) {
    config.socialProviders!.github = {
      clientId: options.githubClientId,
      clientSecret: options.githubClientSecret,
    };
  }

  return betterAuth(config);
}

export type Auth = ReturnType<typeof createAuth>;
