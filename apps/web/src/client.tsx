import { RouterClient } from "@tanstack/react-router/ssr/client";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { getRouter } from "./router";

const router = getRouter();

hydrateRoot(
  document,
  <StrictMode>
    <RouterClient router={router} />
  </StrictMode>,
);
