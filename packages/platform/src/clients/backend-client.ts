import { treaty } from "@elysiajs/eden";
import type { App } from "../../../../apps/backend/src/app";
import type { Session } from "../integrations/auth-server";

interface BackendClientOptions {
  baseUrl: string;
  credentials?: RequestCredentials;
}

export const createBackendClient = ({
  baseUrl,
  credentials = "include",
}: BackendClientOptions) => {
  return treaty<App>(baseUrl, {
    fetch: {
      credentials,
    },
  });
};

export type { App as BackendApp, Session };
