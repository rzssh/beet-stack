import { Elysia } from "elysia";
import { countService } from "./count.service";

export const metricsRoutes = new Elysia({ prefix: "/count" })
  .get("/", () => countService.getCount())
  .post("/increment", () => countService.increment());
