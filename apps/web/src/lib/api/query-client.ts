import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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

// Global error handler for mutations
function handleMutationError(error: unknown) {
  const errorMessage = getErrorMessage(error);
  const errorCode = getErrorCode(error);

  // Track API errors in analytics
  analytics.capture("api_error", {
    error_message: errorMessage,
    error_code: errorCode,
    location: window.location.pathname,
    timestamp: new Date().toISOString(),
  });

  // Show user-friendly error toast
  toast.error(errorMessage);

  console.error("API Error:", error);
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60, // 1 minute
      retry: (failureCount, error) => {
        // Don't retry client errors (4xx) except for 408, 429
        if (isApiError(error)) {
          const statusCode = error.error.statusCode;
          if (
            statusCode >= 400 &&
            statusCode < 500 &&
            statusCode !== 408 &&
            statusCode !== 429
          ) {
            return false;
          }
        }

        // Retry up to 3 times for server errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: { onError: handleMutationError },
  },
});

export { queryClient };
