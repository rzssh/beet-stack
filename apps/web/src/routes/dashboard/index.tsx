import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Suspense } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { BillingCard } from "~/features/billing/_components/billing-card";
import { CountCard } from "~/features/count/_components/count-card";
import { countElysiaController } from "~/features/count/_controllers/count-elysia-controller";
import { MessageForm } from "~/features/message/_components/message-form";
import { MessageList } from "~/features/message/_components/message-list";
import { messageController } from "~/features/message/_controllers/message-controller";
import { UploadCard } from "~/features/storage/_components/upload-card";
import { getSessionFn } from "~/lib/better-auth/auth-session";
import { authClientRepo } from "~/lib/better-auth/auth-client-repo";
import { LogOut, User, Calendar, Mail, Shield } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
  loader: async () => {
    // Get session data from parent or fetch fresh
    const session = await getSessionFn();
    return {
      user: session?.user || null,
    };
  },
});

function DashboardIndex() {
  // Use loader data instead of useSession hook to eliminate flicker
  const { user } = Route.useLoaderData();
  const router = useRouter();
  const metadata = (user as { metadata?: Record<string, string> } | undefined)
    ?.metadata;
  const customerId = metadata?.stripeCustomerId ?? user?.id ?? "";

  return (
    <div className="space-y-10">
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-heading-2">
          Welcome back, {user?.name ?? "founder"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          This dashboard stitches together auth, metrics, billing, storage, and
          CRUD so you can focus on customer value instead of boilerplate.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <UserProfileCard user={user} router={router} />
        <CountPanel />
        <BillingCard customerId={customerId} />
        <UploadCard />
      </section>

      <section className="space-y-4">
        <header>
          <h2 className="text-heading-3">Team notes</h2>
          <p className="text-muted-foreground text-sm">
            Messages are scoped to your Better Auth user and persisted with
            Drizzle so you can build collaborative features quickly.
          </p>
        </header>
        <Suspense fallback={<MessageSkeleton />}>
          <MessagesPanel />
        </Suspense>
      </section>
    </div>
  );
}

const CountPanel = () => {
  const { data, isLoading, refetch } = countElysiaController.useCount();
  const { incrementCount, isPending } =
    countElysiaController.useIncrementCount();

  return (
    <CountCard>
      <CountCard.Header
        title="Product heartbeat"
        description="Simple counter powered by the API + Eden Treaty"
      />
      <CountCard.Display
        count={data?.count ?? 0}
        description="Total button presses"
      />
      <CountCard.Actions
        onIncrement={() => incrementCount()}
        onRefresh={() => void refetch()}
        isLoading={isLoading || isPending}
        backTo="/dashboard"
      />
    </CountCard>
  );
};

const MessagesPanel = () => {
  const { data } = messageController.useMessagesQuery();
  const createMutation = messageController.useCreateMessageMutation();
  const deleteMutation = messageController.useDeleteMessageMutation();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <MessageForm
        formTitle="Capture a thought"
        submitLabel="Save message"
        onSubmit={({ title, content }) =>
          createMutation.mutate({
            params: { title, content },
          })
        }
        isSubmitting={createMutation.isPending}
      />
      <MessageList
        messages={data.messages}
        emptyMessage="Nothing yet. Start by creating a note."
        onDelete={({ id }) =>
          deleteMutation.mutate({
            id,
          })
        }
      />
    </div>
  );
};

const MessageSkeleton = () => (
  <div className="grid gap-6 lg:grid-cols-2">
    <Skeleton className="h-80 w-full" />
    <div className="grid gap-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
);

const UserProfileCard = ({ user, router }: { user: any; router: any }) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Profile</CardTitle>
            <CardDescription>Account details</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {user ? (
          <>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{user.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user.email}</span>
              </div>
              {user.emailVerified && (
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Verified</span>
                </div>
              )}
              {user.createdAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            <Button
              onClick={async () => {
                await authClientRepo.signOut();
                await router.invalidate();
                window.location.href = "/";
              }}
              variant="outline"
              size="sm"
              className="w-full gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            No user data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};
