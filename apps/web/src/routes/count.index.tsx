import { Link, createFileRoute } from "@tanstack/react-router";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Server, Database, ExternalLink } from "lucide-react";
import { CountCard } from "~/features/count/_components/count-card";
import { countElysiaController } from "~/features/count/_controllers/count-elysia-controller";
import { countTanStackController } from "~/features/count/_controllers/count-tanstack-controller";
import { elysiaCountQueryOptions } from "~/features/count/_lib/count-elysia-queries";
import { countQueryOptions } from "~/features/count/_lib/count-queries";

export const Route = createFileRoute("/count/")({
  loader: async ({ context }) => {
    // Preload both counter values
    const [elysiaCount, tanstackCount] = await Promise.allSettled([
      context.queryClient.ensureQueryData(elysiaCountQueryOptions()),
      context.queryClient.ensureQueryData(countQueryOptions),
    ]);
    
    return {
      elysiaCount: elysiaCount.status === "fulfilled" ? elysiaCount.value.count : 0,
      tanstackCount: tanstackCount.status === "fulfilled" ? tanstackCount.value.count.count : 0,
    };
  },
  component: CountIndexPage,
});

// TanStack Counter Display
function TanStackCounterPreview() {
  const { data } = countTanStackController.useCount();
  const { incrementCount, isPending } = countTanStackController.useIncrementCount();

  return (
    <Card className="relative">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">TanStack Start</CardTitle>
              <CardDescription className="text-sm">Server functions + local file</CardDescription>
            </div>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/count/tanstack">
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <div className="px-6 pb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-4">
            {data?.count.count ?? "..."}
          </div>
          <Button 
            onClick={() => incrementCount()}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? "..." : "Increment"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Elysia Counter Display  
function ElysiaCounterPreview() {
  const { data } = countElysiaController.useCount();
  const { incrementCount, isPending } = countElysiaController.useIncrementCount();

  return (
    <Card className="relative">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Server className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Elysia API</CardTitle>
              <CardDescription className="text-sm">Eden Treaty + external backend</CardDescription>
            </div>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/count/elysia">
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <div className="px-6 pb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-accent-foreground mb-4">
            {data?.count ?? "..."}
          </div>
          <Button 
            onClick={() => incrementCount()}
            disabled={isPending}
            variant="secondary"
            className="w-full"
          >
            {isPending ? "..." : "Increment"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function CountIndexPage() {
  return (
    <div className="container py-10">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Counter Showcase</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Two different counter implementations demonstrating various architectural approaches.
          Try them both and see how they compare!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
        <TanStackCounterPreview />
        <ElysiaCounterPreview />
      </div>

      <div className="text-center">
        <div className="inline-flex items-center gap-4 text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-lg">
          <span>Both use TanStack Query for state management</span>
          <span>•</span>
          <span>Click the external link icons for detailed views</span>
        </div>
      </div>
    </div>
  );
}