export interface ApiErrorBody {
  message: string;
  code: string;
  statusCode: number;
  requestId: string;
  timestamp: string;
  path: string;
}

export interface ApiErrorResponse {
  error: ApiErrorBody;
}

type EdenResponse = {
  data: unknown;
  error: unknown;
  status: number;
};

function isEnvelope(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as { error: unknown }).error === "object" &&
    (value as { error: unknown }).error !== null
  );
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(
    body: ApiErrorBody | undefined,
    status: number,
    fallback: string,
  ) {
    super(body?.message ?? `${fallback} (HTTP ${status})`);
    this.name = "ApiError";
    this.status = status;
    this.code = body?.code ?? "UNKNOWN";
  }
}

export function unwrap<T>(response: EdenResponse, fallback: string): T {
  if (response.error != null || response.data == null) {
    throw new ApiError(
      isEnvelope(response.error) ? response.error.error : undefined,
      response.status,
      fallback,
    );
  }
  return response.data as T;
}
