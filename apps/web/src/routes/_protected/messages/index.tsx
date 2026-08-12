import { type MessageInput, messageInputSchema } from "@beet/core/contracts";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { LogOut, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  loadMessages,
  messageController,
} from "~/features/message/controllers/message-controller";
import { authClient } from "~/lib/auth/client";

type Message = Awaited<ReturnType<typeof loadMessages>>[number];

export const Route = createFileRoute("/_protected/messages/")({
  loader: async ({ context }) => ({
    messages: await loadMessages(),
    user: context.user,
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const initial = Route.useLoaderData();
  const router = useRouter();
  const { data: messages = initial.messages, error } =
    messageController.useMessagesQuery(initial.messages);

  return (
    <main className="container mx-auto min-h-screen max-w-4xl space-y-8 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/" className="text-muted-foreground text-sm underline">
            Home
          </Link>
          <h1 className="font-bold text-3xl">Your messages</h1>
          <p className="text-muted-foreground">
            Signed in as {initial.user?.email}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            await authClient.signOut();
            await router.invalidate();
            await router.navigate({ to: "/" });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </header>

      <CreateMessage />
      {error && <ErrorText error={error} />}
      <section className="space-y-4" aria-label="Saved messages">
        {messages.map((message) => (
          <MessageEditor key={message.id} message={message} />
        ))}
        {messages.length === 0 && (
          <p className="rounded-lg border p-8 text-center text-muted-foreground">
            No messages yet.
          </p>
        )}
      </section>
    </main>
  );
}

function CreateMessage() {
  const mutation = messageController.useCreateMessageMutation();
  const form = useForm<MessageInput>({
    resolver: zodResolver(messageInputSchema),
    defaultValues: { title: "", content: "" },
  });

  const submit = async (values: MessageInput) => {
    await mutation.mutateAsync(values);
    form.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" /> Create message
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="new-title">Title</FormLabel>
                  <FormControl>
                    <Input id="new-title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="new-content">Content</FormLabel>
                  <FormControl>
                    <Textarea id="new-content" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {mutation.error && <ErrorText error={mutation.error} />}
            <Button disabled={mutation.isPending} type="submit">
              <Save className="mr-2 h-4 w-4" />
              {mutation.isPending ? "Creating…" : "Create"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function MessageEditor({ message }: { message: Message }) {
  const update = messageController.useUpdateMessageMutation();
  const remove = messageController.useDeleteMessageMutation();
  const [editing, setEditing] = useState(false);
  const form = useForm<MessageInput>({
    resolver: zodResolver(messageInputSchema),
    defaultValues: { title: message.title, content: message.content },
  });

  const submit = async (values: MessageInput) => {
    await update.mutateAsync({ id: message.id, ...values });
    setEditing(false);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {editing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submit)} className="space-y-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={`title-${message.id}`}>Title</FormLabel>
                    <FormControl>
                      <Input id={`title-${message.id}`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={`content-${message.id}`}>
                      Content
                    </FormLabel>
                    <FormControl>
                      <Textarea id={`content-${message.id}`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {update.error && <ErrorText error={update.error} />}
              <div className="flex gap-2">
                <Button disabled={update.isPending} type="submit">
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-3">
            <div>
              <h2 className="font-semibold text-xl">{message.title}</h2>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {message.content}
              </p>
            </div>
            <p className="text-muted-foreground text-xs">
              Updated {new Date(message.updatedAt).toLocaleString()}
            </p>
            {remove.error && <ErrorText error={remove.error} />}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(true)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={remove.isPending}
                onClick={() => {
                  if (window.confirm("Delete this message?"))
                    remove.mutate(message.id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ErrorText({ error }: { error: Error }) {
  return <p className="text-destructive text-sm">{error.message}</p>;
}
