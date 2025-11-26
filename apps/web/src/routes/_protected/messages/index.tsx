import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare, Plus } from "lucide-react";
import { Suspense } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Skeleton } from "~/components/ui/skeleton";
import { MessageForm } from "~/features/message/components/message-form";
import { MessageList } from "~/features/message/components/message-list";
import { messageController } from "~/features/message/controllers/message-controller";

export const Route = createFileRoute("/_protected/messages/")({
  component: MessagesIndex,
  loader: async ({ context }) => {
    try {
      const response = await context.api().messages.get();
      return {
        initialMessages: response.data?.messages ?? [],
        user: context.user,
      };
    } catch {
      return {
        initialMessages: [],
        user: context.user,
      };
    }
  },
});

function MessagesIndex() {
  const { initialMessages, user } = Route.useLoaderData();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Messages</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto">
          <Button asChild size="sm">
            <Link to="/messages/new">
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Link>
          </Button>
        </div>
      </header>

      <div className="space-y-6">
        <section className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-3xl tracking-tight">Messages</h1>
            <p className="text-muted-foreground">
              Manage team messages with full CRUD operations and real-time
              updates.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  All Messages
                </CardTitle>
                <CardDescription>
                  Messages are scoped to your user and demonstrate server-side
                  prefetching with client-side updates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<MessageListSkeleton />}>
                  <MessagesList initialData={initialMessages} />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Create</CardTitle>
                <CardDescription>
                  Create a new message with optimistic updates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<MessageFormSkeleton />}>
                  <MessagesForm />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Data Fetching Patterns</CardTitle>
              <CardDescription>
                This page demonstrates various data fetching patterns in the
                TanStack Start + Elysia stack.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-medium">Server-side Prefetch</h4>
                <p className="text-muted-foreground text-sm">
                  Messages are prefetched in the route loader using the
                  isomorphic API client.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Client-side Queries</h4>
                <p className="text-muted-foreground text-sm">
                  React Query provides caching, background updates, and
                  optimistic updates.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Real-time Updates</h4>
                <p className="text-muted-foreground text-sm">
                  WebSocket integration provides real-time message updates
                  across clients.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

const MessagesList = ({ initialData }: { initialData: any[] }) => {
  const { data = { messages: initialData } } =
    messageController.useMessagesQuery();
  const deleteMutation = messageController.useDeleteMessageMutation();

  return (
    <MessageList
      messages={data.messages || []}
      emptyMessage="No messages yet. Create your first message to get started."
      onDelete={({ id }) => deleteMutation.mutate({ id })}
      isDeleting={deleteMutation.isPending}
    />
  );
};

const MessagesForm = () => {
  const createMutation = messageController.useCreateMessageMutation();

  return (
    <MessageForm
      formTitle="Quick Create"
      submitLabel="Create Message"
      onSubmit={async ({ title, content }) => {
        await createMutation.mutateAsync({
          params: { title, content },
        });
      }}
      isSubmitting={createMutation.isPending}
      showFormState={true}
    />
  );
};

const MessageListSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-20 w-full" />
  </div>
);

const MessageFormSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-10 w-full" />
  </div>
);
