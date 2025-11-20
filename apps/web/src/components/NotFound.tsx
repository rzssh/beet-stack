import { Link } from "@tanstack/react-router";
import { FileQuestion, ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { analytics } from "~/lib/analytics";

export function NotFound() {
  // Track 404 in analytics
  analytics.capture("page_not_found", {
    location: window.location.pathname,
    timestamp: new Date().toISOString(),
  });

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-8 p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 text-muted-foreground">
        <FileQuestion className="h-8 w-8" />
        <h1 className="text-2xl font-semibold">Page Not Found</h1>
      </div>

      <div className="w-full space-y-4">
        <Alert>
          <FileQuestion className="h-4 w-4" />
          <AlertDescription className="font-medium">
            The page you're looking for doesn't exist or may have been moved.
          </AlertDescription>
        </Alert>

        <div className="text-center text-sm text-muted-foreground">
          Error 404 • Page Not Found
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          onClick={() => {
            analytics.capture("not_found_back_clicked");
            window.history.back();
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

      <div className="text-xs text-muted-foreground text-center max-w-md">
        If you believe this is an error, please check the URL or return to the homepage.
      </div>
    </div>
  );
}
