import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";

export function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 p-8 text-center">
      <h1 className="font-semibold text-3xl">Page not found</h1>
      <p className="text-muted-foreground">No route exists at this URL.</p>
      <Button asChild>
        <Link to="/">Home</Link>
      </Button>
    </main>
  );
}
