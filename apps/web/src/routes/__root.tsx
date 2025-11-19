import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  ScriptOnce,
  Scripts,
} from "@tanstack/react-router";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import "~/styles/app.css";

import { analytics } from "~/lib/analytics";
import { getSessionFn } from "~/lib/better-auth/auth-session";
import type { Session } from "~/lib/better-auth/auth-session";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  session?: Session | null;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "React TanStarter",
      },
    ],
    links: [
      { rel: "stylesheet", href: "/src/styles/app.css" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  beforeLoad: async () => {
    // Start session fetch early but don't await - this prefetches and caches the session
    // without blocking the route rendering
    try {
      getSessionFn(); // Fire and forget - will populate cache for later use
    } catch {
      // Ignore errors in prefetch
    }
  },
  loader: async () => {
    // Attempt to get session from cache, but don't block if not available
    try {
      const session = await getSessionFn();
      return { session };
    } catch {
      return { session: null };
    }
  },
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { readonly children: React.ReactNode }) {
  return (
    // suppress since we're updating the "dark" class in a custom script below
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <ScriptOnce>
          {`document.documentElement.classList.toggle(
            'dark',
            localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
            )`}
        </ScriptOnce>

        <ScriptOnce>
          {`
            // Initialize PostHog
            window.POSTHOG_KEY = '${import.meta.env.VITE_POSTHOG_KEY || ""}';
            window.POSTHOG_HOST = '${import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com"}';
          `}
        </ScriptOnce>

        {children}

        <ReactQueryDevtools buttonPosition="bottom-left" />
        <TanStackRouterDevtools position="bottom-right" />

        <Scripts />
      </body>
    </html>
  );
}
