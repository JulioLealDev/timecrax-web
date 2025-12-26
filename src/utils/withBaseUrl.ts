export function withBaseUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  
  if (url.startsWith("data:image/")) {
    return url;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
  if (!base) return undefined;

  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}
