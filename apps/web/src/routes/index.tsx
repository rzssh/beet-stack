import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async ({ context }) => ({ user: context.user }),
});

function Home() {
  const { user } = Route.useLoaderData();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 sm:px-10">
        <header className="flex items-center justify-between border-b py-6">
          <p className="font-semibold tracking-tight">BEET Stack</p>
          <p className="text-muted-foreground text-sm">
            Full-stack TypeScript starter
          </p>
        </header>

        <div className="grid flex-1 items-center gap-16 py-16 lg:grid-cols-[1.15fr_0.85fr]">
          <section>
            <p className="mb-5 font-mono text-primary text-sm uppercase tracking-widest">
              Bun · Elysia · Expo · TanStack
            </p>
            <h1 className="max-w-3xl font-semibold text-5xl tracking-tight sm:text-7xl">
              One backend.
              <br />
              Two clients.
            </h1>
            <p className="mt-7 max-w-xl text-lg text-muted-foreground sm:text-xl">
              A working message app for web and mobile, built around one typed
              API. Authentication, data ownership, and PostgreSQL are already
              wired in.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              {user ? (
                <Button asChild size="lg">
                  <Link to="/messages">Open your messages</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link to="/signup">Create account</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/signin">Sign in</Link>
                  </Button>
                </>
              )}
            </div>
          </section>

          <section className="border-t lg:border-t-0 lg:border-l lg:pl-12">
            <h2 className="py-5 font-medium text-sm uppercase tracking-widest">
              Included
            </h2>
            <dl>
              <StackRow label="Web" value="TanStack Start" />
              <StackRow label="Mobile" value="Expo" />
              <StackRow label="API" value="Elysia + Eden" />
              <StackRow label="Auth" value="Better Auth" />
              <StackRow label="Data" value="PostgreSQL + Drizzle" />
            </dl>
          </section>
        </div>
      </div>
    </main>
  );
}

function StackRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[6rem_1fr] border-t py-5 last:border-b">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
