import { Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface Message {
  id: string;
  title: string;
  content: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface MessageListProps {
  messages: Message[];
  emptyMessage?: string;
  onDelete?: (message: { id: string }) => void;
  isDeleting?: boolean;
}

export function MessageList({
  messages,
  emptyMessage = "No messages yet",
  onDelete,
  isDeleting,
}: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Card key={message.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{message.title}</CardTitle>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete({ id: message.id })}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-muted-foreground">{message.content}</p>
            <div className="text-muted-foreground text-xs">
              Created: {new Date(message.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
