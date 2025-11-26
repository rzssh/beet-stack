import { createFileRoute } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { api } from "~/lib/api";
import {
  useCreateMessageMutation,
  useDeleteMessageMutation,
  useMessagesQuery,
} from "~/lib/api/messages";

export const Route = createFileRoute("/messages/")({
  loader: async () => {
    // Server-side prefetching following TanStack Start best practices
    try {
      const response = await api().messages.get();
      return { messages: response.data?.messages ?? [] };
    } catch {
      return { messages: [] };
    }
  },
  component: MessagesPage,
});

function MessagesPage() {
  const { messages: initialMessages } = Route.useLoaderData();
  const { data: messages = initialMessages } = useMessagesQuery();
  const { mutate: createMessage, isPending: isCreatingMessage } =
    useCreateMessageMutation();
  const { mutate: deleteMessage, isPending: isDeletingMessage } =
    useDeleteMessageMutation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-2xl">Your Messages</h2>
        <Button
          onClick={() =>
            createMessage({
              title: "New Message",
              content: "Hello world!",
            })
          }
          disabled={isCreatingMessage}
        >
          Create Message
        </Button>
      </div>

      <div className="grid gap-4">
        {messages.map((message) => (
          <Card key={message.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{message.title}</h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  {message.content}
                </p>
                <p className="mt-2 text-muted-foreground text-xs">
                  Created: {new Date(message.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMessage({ id: message.id })}
                disabled={isDeletingMessage}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
        {messages.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No messages yet. Create your first message!
          </div>
        )}
      </div>
    </div>
  );
}
