import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/messages")({
  component: MessagesLayout,
});

function MessagesLayout() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Messages</h1>
        <p className="text-muted-foreground">Manage your messages</p>
      </div>
      <Outlet />
    </div>
  );
}
