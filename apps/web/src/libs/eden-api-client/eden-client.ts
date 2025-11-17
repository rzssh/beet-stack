import {
  createBackendClient,
} from "@acme/platform/clients/backend";
import type {
  BackendApp as App,
  Session,
} from "@acme/platform/clients/backend";

const baseUrl =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.PUBLIC_BACKEND_URL ||
  import.meta.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:3001";

export const api = createBackendClient({
  baseUrl,
});

export type { Session, App };
