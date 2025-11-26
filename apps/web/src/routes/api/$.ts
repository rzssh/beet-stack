import {
  countRoutes,
  createServerConfiguration,
  messagesRoutes,
} from "@acme/core/server";
import { createFileRoute } from "@tanstack/react-router";
import { Elysia } from "elysia";
import { auth } from "~/lib/auth/server";

export const app = new Elysia({ prefix: "/api" })
  .use(createServerConfiguration({ serviceName: "tanstack-start", auth }))
  .use(countRoutes)
  .use(messagesRoutes);

const handle = ({ request }: { request: Request }) => app.fetch(request);

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
      PUT: handle,
      DELETE: handle,
      PATCH: handle,
    },
  },
});

export type App = typeof app;
