import { treaty } from "@elysiajs/eden";
import type {
  App as ElysiaBackendApp,
  Session,
} from "../../../apps/backend/dist";

const runtimeEnv = process.env;

const baseUrl =
  runtimeEnv.VITE_BACKEND_URL ??
  runtimeEnv.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:3001";

export const api = treaty<ElysiaBackendApp>(baseUrl, {
  fetch: {
    credentials: "include",
  },
});

export type { ElysiaBackendApp, Session };
export type App = ElysiaBackendApp;
