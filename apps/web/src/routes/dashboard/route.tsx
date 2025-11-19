import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
} from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ThemeToggle } from "~/components/ThemeToggle";
import { authClientRepo } from "~/lib/better-auth/auth-client-repo";
import { getSessionFn } from "~/lib/better-auth/auth-session";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
  beforeLoad: async () => {
    // Use server function for session check
    const session = await getSessionFn();
    if (!session?.user) {
      throw redirect({ to: "/signin" });
    }
  },
  loader: async () => {
    // Pass session data to components to eliminate flicker
    const session = await getSessionFn();
    return { 
      user: session?.user || null,
      session: session || null 
    };
  },
});

function DashboardLayout() {
  // Use loader data instead of useSession hook to eliminate flicker
  const { user } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="text-lg font-semibold">
              {user?.name ?? "Anonymous founder"}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">Early access</Badge>
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link to="/">Return home</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
