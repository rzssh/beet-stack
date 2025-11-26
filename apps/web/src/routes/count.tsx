import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/count")({ component: CountLayout });

function CountLayout() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Count Demo</h1>
        <p className="text-muted-foreground">
          Compare different API integration patterns
        </p>

        <nav className="mt-4 flex gap-4">
          <Link
            to="/count"
            className="rounded-md border px-3 py-2 hover:bg-accent"
            activeProps={{ className: "bg-accent" }}
          >
            Overview
          </Link>
          <Link
            to="/count/elysia"
            className="rounded-md border px-3 py-2 hover:bg-accent"
            activeProps={{ className: "bg-accent" }}
          >
            Elysia API
          </Link>
          <Link
            to="/count/tanstack"
            className="rounded-md border px-3 py-2 hover:bg-accent"
            activeProps={{ className: "bg-accent" }}
          >
            TanStack Server Functions
          </Link>
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
