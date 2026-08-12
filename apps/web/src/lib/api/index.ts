import { treaty } from "@elysiajs/eden";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { app } from "~/routes/api/$";

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
      treaty<typeof app>(globalThis.location.origin, {
        headers: { "x-client-platform": "web" },
        fetch: { credentials: "include" },
      }).api,
  );
