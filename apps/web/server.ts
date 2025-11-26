#!/usr/bin/env bun

/**
 * This is a minimal entry-point for the web application. It is also set up using Elysia.
 * It helps serving static assets from the client build as well as forwarding all other requests
 * to the server-side handler in TanStack Start (which is also Elysia btw).
 */

import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";

const port = Number(process.env.PORT ?? 3000);
const host = "0.0.0.0";
const SERVER_ENTRY = "./dist/server/server.js";

const { default: handler } = await import(SERVER_ENTRY);

new Elysia()
  // Single static plugin for all static files
  .use(
    staticPlugin({
      assets: "dist/client",
      prefix: "/",
      alwaysStatic: true, // Let TanStack Start handle if file doesn't exist (?)
    }),
  )
  .all("*", async ({ request }) => handler.fetch(request))
  .listen({ port, hostname: host });
