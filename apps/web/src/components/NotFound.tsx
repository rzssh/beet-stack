import { Link } from "@tanstack/react-router";
import { ArrowLeft, FileQuestion, Home, Search } from "lucide-react";
import { useEffect } from "react";
import { analytics } from "~/lib/analytics";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";

export function NotFound() {
  // Track 404 in analytics (client-side only)
  useEffect(() => {
    analytics.events.custom("page_not_found", {
      location: typeof window !== "undefined" ? window.location.pathname : "",
      timestamp: new Date().toISOString(),
    });
  }, []);

  return (
    <div className="mx-auto flex min-w-0 max-w-2xl flex-1 flex-col items-center justify-center gap-8 p-8">
      <div className="flex items-center gap-3 text-muted-foreground">
        <FileQuestion className="h-8 w-8" />
        <h1 className="font-semibold text-2xl">Page Not Found</h1>
      </div>

      <div className="w-full space-y-4">
        <Alert>
          <FileQuestion className="h-4 w-4" />
          <AlertDescription className="font-medium">
            The page you're looking for doesn't exist or may have been moved.
          </AlertDescription>
        </Alert>

        <div className="text-center text-muted-foreground text-sm">
          Error 404 • Page Not Found
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          onClick={() => {
            analytics.capture("not_found_back_clicked");
            if (typeof window !== "undefined") {
              window.history.back();
            }
          }}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>

        <Button asChild className="flex items-center gap-2">
          <Link to="/">
            <Home className="h-4 w-4" />
            Home
          </Link>
        </Button>

        <Button asChild variant="outline" className="flex items-center gap-2">
          <Link to="/dashboard">
            <Search className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>

      <div className="max-w-md text-center text-muted-foreground text-xs">
        If you believe this is an error, please check the URL or return to the
        homepage.
      </div>
    </div>
  );
}
