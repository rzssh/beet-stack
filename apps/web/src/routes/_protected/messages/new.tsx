import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MessageSquare } from "lucide-react";
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
import { MessageForm } from "~/features/message/components/message-form";
import { messageController } from "~/features/message/controllers/message-controller";

export const Route = createFileRoute("/_protected/messages/new")({
  component: NewMessagePage,
});

function NewMessagePage() {
  const navigate = useNavigate();
  const createMutation = messageController.useCreateMessageMutation();

  const handleSubmit = async ({
    title,
    content,
  }: {
    title: string;
    content: string;
  }) => {
    try {
      await createMutation.mutateAsync({
        params: { title, content },
      });
      navigate({ to: "/messages" });
    } catch (error) {
      console.error("Failed to create message:", error);
    }
  };

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
                <BreadcrumbLink asChild>
                  <Link to="/messages">Messages</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>New</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto">
          <Button variant="outline" size="sm" asChild>
            <Link to="/messages">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Messages
            </Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl space-y-6">
        <section className="text-center">
          <h1 className="font-semibold text-3xl tracking-tight">
            Create New Message
          </h1>
          <p className="mt-2 text-muted-foreground">
            This form demonstrates optimistic updates and error handling with
            React Query mutations.
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Message Details
            </CardTitle>
            <CardDescription>
              Fill out the form below to create a new message. The form uses
              TanStack Form with Zod validation and real-time feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MessageForm
              formTitle=""
              submitLabel="Create Message"
              onSubmit={handleSubmit}
              isSubmitting={createMutation.isPending}
              onCancel={() => navigate({ to: "/messages" })}
              showFormState={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Implementation Details</CardTitle>
            <CardDescription>
              This page showcases several key patterns in the TanStack Start +
              Elysia stack.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Form Validation</h4>
                <p className="text-muted-foreground text-sm">
                  TanStack Form with Zod schema validation for type-safe form
                  handling and real-time feedback.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Optimistic Updates</h4>
                <p className="text-muted-foreground text-sm">
                  React Query mutations with automatic cache invalidation and
                  error rollback.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">API Integration</h4>
                <p className="text-muted-foreground text-sm">
                  Eden Treaty provides end-to-end type safety from Elysia server
                  to React client.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Navigation</h4>
                <p className="text-muted-foreground text-sm">
                  Programmatic navigation with TanStack Router after successful
                  form submission.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
