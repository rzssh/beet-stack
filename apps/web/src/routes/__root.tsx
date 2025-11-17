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

import { getSessionFn } from "~/libs/better-auth/auth-session";
import { analytics } from "~/lib/analytics";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  session: Awaited<ReturnType<typeof getSessionFn>>;
}>()({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.fetchQuery({
      queryKey: ["session"],
      queryFn: ({ signal }) => getSessionFn({ signal }),
    }); // we're using react-query for caching, see router.tsx
    return { session };
  },
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
  }),
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
      <body>
        <ScriptOnce>
          {`document.documentElement.classList.toggle(
            'dark',
            localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
            )`}
        </ScriptOnce>
        
        <ScriptOnce>
          {`
            // Initialize PostHog
            window.POSTHOG_KEY = '${import.meta.env.VITE_POSTHOG_KEY || ''}';
            window.POSTHOG_HOST = '${import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com'}';
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
