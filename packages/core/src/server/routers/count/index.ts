import { Elysia } from "elysia";
import { countService } from "./service";

export const countRoutes = new Elysia({ prefix: "/count" })
  .get("/", () => countService.getCount())
  .post("/", () => countService.increment());
