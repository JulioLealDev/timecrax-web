export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5139";

function getToken() {
  return localStorage.getItem("auth_token");
}

export async function apiRequest<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();

    const headers: HeadersInit = {
        ...(options.headers ?? {}),
    };

    const isFormData = options.body instanceof FormData;

    if (options.body && !isFormData && !(headers as any)["Content-Type"]) {
        (headers as any)["Content-Type"] = "application/json";
    }

    if (token) {
        (headers as any).Authorization = `Bearer ${token}`;
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
        const message =
        (data && typeof data === "object" && ((data as any).message || (data as any).error)) ||
        (typeof data === "string" && data) ||
        `Erro HTTP ${res.status} em ${path}`;
        throw new Error(message);
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
