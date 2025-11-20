import {
  ErrorComponent,
  type ErrorComponentProps,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from "@tanstack/react-router";
import { AlertTriangle, RefreshCw, ArrowLeft, Home } from "lucide-react";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { analytics } from "~/lib/analytics";

interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    statusCode: number;
    requestId?: string;
    timestamp?: string;
    path?: string;
    context?: Record<string, any>;
  };
}

function isApiError(error: any): error is ApiErrorResponse {
  return (
    typeof error === "object" &&
    error?.error &&
    typeof error.error.message === "string" &&
    typeof error.error.code === "string"
  );
}

function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === "string") {
    return error;
  }
  
  return "An unexpected error occurred";
}

function getErrorCode(error: unknown): string | undefined {
  if (isApiError(error)) {
    return error.error.code;
  }
  return undefined;
}

export function DefaultCatchBoundary({ error }: Readonly<ErrorComponentProps>) {
  const router = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });

  const errorMessage = getErrorMessage(error);
  const errorCode = getErrorCode(error);

  // Track error in analytics
  analytics.capture("error_boundary_triggered", {
    error_message: errorMessage,
    error_code: errorCode,
    location: window.location.pathname,
    timestamp: new Date().toISOString(),
  });

  console.error("Error boundary triggered:", error);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-8 p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 text-destructive">
        <AlertTriangle className="h-8 w-8" />
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
      </div>

      <div className="w-full space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {errorMessage}
          </AlertDescription>
        </Alert>

        {errorCode && (
          <div className="text-sm text-muted-foreground text-center">
            Error Code: {errorCode}
          </div>
        )}

        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 p-4 bg-muted rounded-lg">
            <summary className="cursor-pointer text-sm font-medium mb-2">
              Technical Details (Development Only)
            </summary>
            <ErrorComponent error={error} />
          </details>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          onClick={() => {
            analytics.capture("error_boundary_retry_clicked");
            router.invalidate();
          }}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>

        {isRoot ? (
          <Button asChild variant="secondary" className="flex items-center gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => {
              analytics.capture("error_boundary_back_clicked");
              window.history.back();
            }}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        )}
      </div>

      <div className="text-xs text-muted-foreground text-center max-w-md">
        If this problem persists, please try refreshing the page or contact support.
      </div>
    </div>
  );
}
