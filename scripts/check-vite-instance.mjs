import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const toFileUrl = (p) => pathToFileURL(p).href;
const webPkgUrl = new URL("../apps/web/package.json", import.meta.url);
const webReq = createRequire(toFileUrl(webPkgUrl.pathname));

const webVite = realpathSync(webReq.resolve("vite"));

const reactStartPkg = webReq.resolve("@tanstack/react-start/package.json");
const reactStartReq = createRequire(toFileUrl(reactStartPkg));
const startPluginCorePkg = reactStartReq.resolve("@tanstack/start-plugin-core/package.json");
const startPluginCoreReq = createRequire(toFileUrl(startPluginCorePkg));
const startPluginCoreVite = realpathSync(startPluginCoreReq.resolve("vite"));

const routerPluginPkg = startPluginCoreReq.resolve("@tanstack/router-plugin/package.json");
const routerPluginReq = createRequire(toFileUrl(routerPluginPkg));
const routerPluginVite = realpathSync(routerPluginReq.resolve("vite"));

const paths = [webVite, startPluginCoreVite, routerPluginVite];
const allSame = paths.every((p) => p === paths[0]);

if (!allSame) {
  console.error("Vite is not deduplicated across the TanStack Start plugin graph.");
  console.error("Duplicate Vite module instances break isRunnableDevEnvironment (instanceof), so the TanStack Start dev-server SSR middleware is never installed and the web landing returns HTTP 404.");
  for (const [label, path] of [["web app", webVite], ["@tanstack/start-plugin-core", startPluginCoreVite], ["@tanstack/router-plugin", routerPluginVite]]) {
    console.error(`  ${label}: ${path}`);
  }
  process.exit(1);
}

console.log("Vite resolves to a single physical instance across the TanStack Start plugin graph:");
console.log(`  ${webVite}`);
