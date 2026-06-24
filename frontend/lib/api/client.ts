const PROXY_BASE = "/api/backend";
const CSRF_COOKIE = "vetnova-csrf";
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function getCsrfToken(): Promise<string | null> {
  const existing = readCookie(CSRF_COOKIE);
  if (existing) return existing;

  try {
    const res = await fetch(`${PROXY_BASE}/auth/csrf`, { credentials: "include" });
    const json = await res.json().catch(() => null);
    return readCookie(CSRF_COOKIE) ?? json?.csrfToken ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const method = (options?.method ?? "GET").toUpperCase();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (MUTATING_METHODS.has(method)) {
    const csrfToken = await getCsrfToken();
    if (csrfToken) headers["x-csrf-token"] = csrfToken;
  }

  const { headers: _headers, ...restOptions } = options ?? {};
  const res = await fetch(`${PROXY_BASE}${path}`, {
    headers,
    credentials: "include",
    ...restOptions,
  });

  if (!res.ok) {
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
    }
    if (res.status === 429) {
      throw new Error("Demasiados intentos. Intenta de nuevo en unos minutos.");
    }
    const text = await res.text().catch(() => "");
    let message =
      res.status === 403 ? "No tienes permiso para realizar esta acción." : `Error ${res.status}`;
    try {
      const json = JSON.parse(text);
      message = Array.isArray(json.message) ? json.message[0] : (json.message ?? message);
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: "DELETE",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
};
