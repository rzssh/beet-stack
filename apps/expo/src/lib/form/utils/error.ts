export function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null && "message" in err) {
    return (err as { message?: string }).message ?? "Validation error";
  }
  return "Validation error";
}

export function parseErrors(errors: unknown[]): string[] {
  return errors.map(getErrorMessage);
}
