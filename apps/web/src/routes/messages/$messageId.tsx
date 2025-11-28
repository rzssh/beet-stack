import { createFileRoute } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { api } from "~/lib/api";
import { useMessageQuery } from "~/lib/api/messages";

export const Route = createFileRoute("/messages/$messageId")({
  loader: async ({ params }) => {
    // Server-side prefetching following TanStack Start best practices
    try {
      const { data } = await api().messages({ id: params.messageId }).get();
      return { message: data ?? null };
    } catch {
      return { message: null };
    }
  },
  component: MessageDetailPage,
});

function MessageDetailPage() {
  const { messageId } = Route.useParams();
  const { message: initialMessage } = Route.useLoaderData();
  const { data: message = initialMessage } = useMessageQuery({ id: messageId });

  if (!message) {
    return (
      <div className="py-8 text-center">
        <h2 className="font-semibold text-xl">Message not found</h2>
        <p className="mt-2 text-muted-foreground">
          The message you're looking for doesn't exist.
        </p>
        <Button asChild className="mt-4">
          <a href="/messages">Back to Messages</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <a href="/messages">← Back</a>
        </Button>
        <h1 className="font-bold text-2xl">{message.title}</h1>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
              Content
            </h3>
            <p className="mt-2">{message.content}</p>
          </div>

          <div className="flex gap-8 text-muted-foreground text-sm">
            <div>
              <span className="font-semibold">Created:</span>{" "}
              {new Date(message.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-semibold">Updated:</span>{" "}
              {new Date(message.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
