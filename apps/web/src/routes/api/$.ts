import { createApiApp } from "@acme/core/server";
import { createFileRoute } from "@tanstack/react-router";
import { Elysia } from "elysia";
import { auth } from "~/lib/auth/server";

export const app = new Elysia({ prefix: "/api" }).use(
  createApiApp({ serviceName: "web-api", auth }),
);

const handle = ({ request }: { request: Request }) => app.fetch(request);

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
      DELETE: handle,
      PATCH: handle,
    },
  },
});

export type App = typeof app;
