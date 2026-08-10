import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import type { Auth } from "../auth";
import { env } from "../env";
import { createAttachMiddleware, type Logger } from "./middleware/attach";

type CreateServerConfigurationParams = {
  serviceName: string;
  auth: Auth;
  logger?: Logger;
};

export const createServerConfiguration = ({
  serviceName,
  auth,
  logger,
}: CreateServerConfigurationParams) =>
  new Elysia()
    .use(
      cors({
        origin: env.TRUSTED_ORIGINS,
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
      }),
    )
    .use(createAttachMiddleware(auth, logger))
    .get("/health", () => ({ status: "ok", service: serviceName }))
    .get("/me", ({ user }) => user, { auth: true });
