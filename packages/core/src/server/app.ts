import { Elysia } from "elysia";
import type { Auth } from "../auth";
import { createServerConfiguration } from "./base";
import type { Logger } from "./middleware/attach";
import { messagesRoutes } from "./routers";

export const createApiApp = (config: {
  serviceName: string;
  auth: Auth;
  logger?: Logger;
}) => new Elysia().use(createServerConfiguration(config)).use(messagesRoutes);

export type App = ReturnType<typeof createApiApp>;
