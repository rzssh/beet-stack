import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { LogOut, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await mutation.mutateAsync({ title, content });
    setTitle("");
    setContent("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" /> Create message
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          <label htmlFor="new-title" className="font-medium text-sm">
            Title
          </label>
          <Input
            id="new-title"
            required
            maxLength={100}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <label htmlFor="new-content" className="font-medium text-sm">
            Content
          </label>
          <Textarea
            id="new-content"
            required
            maxLength={1000}
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          {mutation.error && <ErrorText error={mutation.error} />}
          <Button disabled={mutation.isPending} type="submit">
            <Save className="mr-2 h-4 w-4" />
            {mutation.isPending ? "Creating…" : "Create"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function MessageEditor({ message }: { message: Message }) {
  const update = messageController.useUpdateMessageMutation();
  const remove = messageController.useDeleteMessageMutation();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(message.title);
  const [content, setContent] = useState(message.content);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await update.mutateAsync({ id: message.id, title, content });
    setEditing(false);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {editing ? (
          <form onSubmit={submit} className="space-y-3">
            <label
              htmlFor={`title-${message.id}`}
              className="font-medium text-sm"
            >
              Title
            </label>
            <Input
              id={`title-${message.id}`}
              required
              maxLength={100}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <label
              htmlFor={`content-${message.id}`}
              className="font-medium text-sm"
            >
              Content
            </label>
            <Textarea
              id={`content-${message.id}`}
              required
              maxLength={1000}
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
            {update.error && <ErrorText error={update.error} />}
            <div className="flex gap-2">
              <Button disabled={update.isPending} type="submit">
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
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
