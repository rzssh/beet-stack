import { createFileRoute } from "@tanstack/react-router";
import { CountCard } from "~/features/count/components/count-card";
import { api } from "~/lib/api";

export const Route = createFileRoute("/count/elysia")({
  loader: async () => {
    // Server-side prefetching following TanStack Start best practices
    try {
      const response = await api().count.get();
      return { count: response.data?.count ?? 0 };
    } catch {
      return { count: 0 };
    }
  },
  component: CountElysiaPage,
});

function CountElysiaPage() {
  return (
    <div className="space-y-6">
      <div className="border-blue-500 border-l-4 pl-4">
        <h2 className="font-semibold text-xl">Elysia API Integration</h2>
        <p className="text-muted-foreground">
          Using Eden Treaty client with isomorphic functions to connect to
          unified Elysia API.
        </p>
      </div>
      <CountCard />
    </div>
  );
}
