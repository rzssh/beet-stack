import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { countElysiaController } from "~/features/count/_controllers/count-elysia-controller";
import { CountCard } from "~/features/count/_components/count-card";
import { messageController } from "~/features/message/_controllers/message-controller";
import { MessageForm } from "~/features/message/_components/message-form";
import { MessageList } from "~/features/message/_components/message-list";
import { BillingCard } from "~/features/billing/_components/billing-card";
import { UploadCard } from "~/features/storage/_components/upload-card";
import { Skeleton } from "~/components/ui/skeleton";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const { session } = Route.useRouteContext();
  const metadata = (session?.user as { metadata?: Record<string, string> } | undefined)?.metadata;
  const customerId = metadata?.stripeCustomerId ?? session?.user?.id ?? "";

  return (
    <div className="space-y-10">
      <section className="rounded-xl border bg-background p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back, {session?.user?.name ?? "founder"}</h1>
        <p className="mt-2 text-muted-foreground">
          This dashboard stitches together auth, metrics, billing, storage, and CRUD so you can focus on customer value instead of boilerplate.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <CountPanel />
        <BillingCard customerId={customerId} />
        <UploadCard />
      </section>

      <section className="space-y-4">
        <header>
          <h2 className="text-2xl font-semibold">Team notes</h2>
          <p className="text-sm text-muted-foreground">
            Messages are scoped to your Better Auth user and persisted with Drizzle so you can build collaborative features quickly.
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
  const { incrementCount, isPending } = countElysiaController.useIncrementCount();

  return (
    <CountCard>
      <CountCard.Header
        title="Product heartbeat"
        description="Simple counter powered by the API + Eden Treaty"
      />
      <CountCard.Display count={data?.count ?? 0} description="Total button presses" />
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
