import { initAuth } from "@acme/core/auth";
import { env } from "@acme/core/env";

export const auth = initAuth({
  baseUrl: env.MICROSERVICE_URL,
  secret: env.AUTH_SECRET,
});
