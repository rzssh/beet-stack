import { Button } from "~/components/ui/button";

export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-background to-secondary/20 py-20">
      <div className="container mx-auto space-y-6 text-center">
        <h1 className="font-bold text-5xl tracking-tight">
          Build Modern Apps with{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TanStack Start
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
          Full-stack React framework with file-based routing, server-side
          rendering, and type-safe APIs powered by Elysia.js
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg">Get Started</Button>
          <Button variant="outline" size="lg">
            View Demo
          </Button>
        </div>
      </div>
    </section>
  );
}
