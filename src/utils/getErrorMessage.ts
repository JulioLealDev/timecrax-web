/**
 * Safely extracts an error message from an unknown error value.
 * Use this for simple error message extraction without translation.
 * For translated error messages, use translateError instead.
 */
export function getErrorMessage(error: unknown, fallback = "An unexpected error occurred"): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return fallback;
}
