import {
  ErrorComponent,
  type ErrorComponentProps,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react";
import { analytics } from "~/lib/analytics";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";

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
    <div className="mx-auto flex min-w-0 max-w-2xl flex-1 flex-col items-center justify-center gap-8 p-8">
      <div className="flex items-center gap-3 text-destructive">
        <AlertTriangle className="h-8 w-8" />
        <h1 className="font-semibold text-2xl">Something went wrong</h1>
      </div>

      <div className="w-full space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {errorMessage}
          </AlertDescription>
        </Alert>

        {errorCode && (
          <div className="text-center text-muted-foreground text-sm">
            Error Code: {errorCode}
          </div>
        )}

        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 rounded-lg bg-muted p-4">
            <summary className="mb-2 cursor-pointer font-medium text-sm">
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
          <Button
            asChild
            variant="secondary"
            className="flex items-center gap-2"
          >
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

      <div className="max-w-md text-center text-muted-foreground text-xs">
        If this problem persists, please try refreshing the page or contact
        support.
      </div>
    </div>
  );
}
