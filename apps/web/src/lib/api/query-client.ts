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
    context?: Record<string, unknown>;
  };
}

function isApiError(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    typeof (error as ApiErrorResponse).error?.message === "string" &&
    typeof (error as ApiErrorResponse).error?.code === "string"
  );
}

function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
}

function getErrorCode(error: unknown): string | undefined {
  if (isApiError(error)) return error.error.code;
  return undefined;
}

function handleMutationError(error: unknown) {
  const errorMessage = getErrorMessage(error);
  const errorCode = getErrorCode(error);

  analytics.capture("api_error", {
    error_message: errorMessage,
    error_code: errorCode,
    location: window.location.pathname,
    timestamp: new Date().toISOString(),
  });

  toast.error(errorMessage);
  console.error("API Error:", error);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
      retry: (failureCount, error) => {
        if (isApiError(error)) {
          const statusCode = error.error.statusCode;
          if (statusCode >= 400 && statusCode < 500 && statusCode !== 408 && statusCode !== 429) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: { onError: handleMutationError },
  },
});

export { queryClient };
