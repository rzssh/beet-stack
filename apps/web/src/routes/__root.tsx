import geistFont from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
import geistMonoFont from "@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import css from "~/styles/app.css?url";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  api: typeof import("~/lib/api").api;
  user: import("@acme/core/auth").Session["user"] | null;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BEET Stack" },
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
    return { user: data && "id" in data ? data : null };
  },
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
