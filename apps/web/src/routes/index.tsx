import { createFileRoute, Link } from "@tanstack/react-router";
import { Database, KeyRound, MessageSquare, Smartphone } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async ({ context }) => ({ user: context.user }),
});

function Home() {
  const { user } = Route.useLoaderData();

  return (
    <main className="container mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-10 px-6 py-16">
      <section className="space-y-5">
        <p className="font-medium text-primary">
          Bun · Elysia · Expo · TanStack
        </p>
        <h1 className="max-w-3xl font-bold text-5xl tracking-tight">
          Authenticated messages, end to end
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Better Auth sessions protect user-owned message CRUD through one
          Elysia contract backed by Drizzle and PostgreSQL. TanStack Start and
          Expo consume that same contract.
        </p>
        <div className="flex gap-3">
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

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SliceCard
          icon={KeyRound}
          title="Session"
          text="Email/password account and cookie session"
        />
        <SliceCard
          icon={MessageSquare}
          title="CRUD"
          text="Create, read, update, and delete owned messages"
        />
        <SliceCard
          icon={Database}
          title="Database"
          text="PostgreSQL schema and Drizzle migrations"
        />
        <SliceCard
          icon={Smartphone}
          title="Two clients"
          text="Web and Expo use one typed API"
        />
      </section>
    </main>
  );
}

function SliceCard({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <Card>
      <CardHeader>
        <Icon className="h-5 w-5 text-primary" />
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        {text}
      </CardContent>
    </Card>
  );
}
