import { createFileRoute } from "@tanstack/react-router";
import { CountCard } from "~/features/count/components/count-card";

export const Route = createFileRoute("/count/tanstack")({
  component: CountTanstackPage,
});

function CountTanstackPage() {
  return (
    <div className="space-y-6">
      <div className="border-green-500 border-l-4 pl-4">
        <h2 className="font-semibold text-xl">TanStack Server Functions</h2>
        <p className="text-muted-foreground">
          Using native TanStack Start server functions for simple operations.
        </p>
      </div>
      <CountCard />
    </div>
  );
}
