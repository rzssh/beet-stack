import { initAuth } from "@beet/core/auth";
import { env } from "@beet/core/env";

export const auth = initAuth({
  baseUrl: env.MICROSERVICE_URL,
  secret: env.AUTH_SECRET,
});
