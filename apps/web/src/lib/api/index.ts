import { env } from "@acme/core/env";
import type { App as ServiceApp } from "@acme/server/app";
import { treaty } from "@elysiajs/eden";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getBaseUrl } from "~/lib/utils";
import { app } from "~/routes/api/$";

const isDev = process.env.NODE_ENV === "development";

export const api = createIsomorphicFn()
  .server(
    () =>
      treaty(app, {
        headers: getRequest().headers,
        fetch: { credentials: "include" },
      }).api,
  )
  .client(
    () =>
      treaty<typeof app>(getBaseUrl(), {
        fetch: { credentials: "include" },
        onRequest: isDev
          ? (path, opts) => console.log(`[API] ${opts.method} ${path}`)
          : undefined,
        onResponse: isDev
          ? (res) => console.log(`[API] ${res.status} ${res.url}`)
          : undefined,
      }).api,
  );

export const serviceApi = createIsomorphicFn()
  .server(() =>
    treaty<ServiceApp>(env.MICROSERVICE_URL, {
      headers: getRequest().headers,
      fetch: { credentials: "include", mode: "cors" },
    }),
  )
  .client(() =>
    treaty<ServiceApp>(env.MICROSERVICE_URL, {
      fetch: { credentials: "include", mode: "cors" },
    }),
  );
