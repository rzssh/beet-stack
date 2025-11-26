// biome-ignore assist/source/organizeImports: side-effects
import { env } from "@acme/core/env";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  ScriptOnce,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "~/components/ui/sonner";

import css from "~/styles/app.css?url";
import geistFont from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
import geistMonoFont from "@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  api: typeof import("~/lib/api").api;
  serviceApi: typeof import("~/lib/api").serviceApi;
  user: import("@acme/core/auth").Session["user"] | null;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "React TanStarter" },
    ],
    links: [
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: geistFont,
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: geistMonoFont,
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: css },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  beforeLoad: async ({ context }) => {
    const { data } = await context.api().me.get();
    return { user: data ?? null };
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
    <html lang="en" suppressHydrationWarning={env.NODE_ENV === "development"}>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning={env.NODE_ENV === "development"}>
        <ScriptOnce>
          {`document.documentElement.classList.toggle(
            'dark',
            localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
            )`}
        </ScriptOnce>

        <ScriptOnce>
          {`
            window.POSTHOG_KEY = '${import.meta.env.VITE_POSTHOG_KEY || ""}';
            window.POSTHOG_HOST = '${import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com"}';
          `}
        </ScriptOnce>

        {children}
        <Toaster />

        <ReactQueryDevtools buttonPosition="bottom-left" />
        <TanStackRouterDevtools position="bottom-right" />

        <Scripts />
      </body>
    </html>
  );
}
