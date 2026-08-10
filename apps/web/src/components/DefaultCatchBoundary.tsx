import {
  type ErrorComponentProps,
  Link,
  useRouter,
} from "@tanstack/react-router";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

export function DefaultCatchBoundary({ error }: Readonly<ErrorComponentProps>) {
  const router = useRouter();
  const message = error instanceof Error ? error.message : "Unexpected error";

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 p-8">
      <div className="flex items-center gap-3 text-destructive">
        <AlertTriangle className="h-7 w-7" />
        <h1 className="font-semibold text-2xl">Request failed</h1>
      </div>
      <p>{message}</p>
      <div className="flex gap-3">
        <Button type="button" onClick={() => router.invalidate()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Home</Link>
        </Button>
      </div>
    </main>
  );
}
