export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5139";

/**
 * SECURITY NOTE: Token is currently stored in localStorage for simplicity.
 *
 * RISK: localStorage is vulnerable to XSS attacks - any JavaScript running on the page
 * can access the token.
 *
 * RECOMMENDED MITIGATION (future):
 * - Migrate to httpOnly cookies managed by the backend
 * - Implement CSRF protection with the cookie approach
 * - Use short-lived access tokens with refresh token rotation
 *
 * CURRENT MITIGATIONS:
 * - Content Security Policy (CSP) headers should be configured
 * - All user input should be sanitized to prevent XSS
 * - Token has expiration time configured on the backend
 */
function getToken() {
  return localStorage.getItem("auth_token");
}

export class ApiError extends Error {
  code?: string;
  status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function apiRequest<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();

    const headers: Record<string, string> = {};

    // Copy existing headers
    if (options.headers) {
        const existingHeaders = options.headers as Record<string, string>;
        Object.assign(headers, existingHeaders);
    }

    const isFormData = options.body instanceof FormData;

    if (options.body && !isFormData && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
        credentials: "include",
    });

    const contentType = res.headers.get("content-type") || "";
    const raw = await res.text();
    const data =
    raw && contentType.includes("application/json") ? safeJsonParse(raw) : (raw ? raw : null);

    if (!res.ok) {
        const errorData = data as Record<string, unknown> | null;
        const code = errorData?.code as string | undefined;
        const message =
        (errorData?.message as string) ||
        (errorData?.error as string) ||
        (typeof data === "string" && data) ||
        `HTTP ${res.status}`;
        throw new ApiError(message, res.status, code);
    }

    return data as T;
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
