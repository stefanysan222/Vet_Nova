import { getToken, clearCurrentUser } from "../auth";

import { API_URL as BASE_URL } from "../config";

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const { headers: _headers, ...restOptions } = options ?? {};
  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...restOptions,
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearCurrentUser();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
    }
    if (res.status === 403) {
      throw new Error("No tienes permiso para realizar esta acción.");
    }
    const text = await res.text().catch(() => "");
    let message = `Error ${res.status}`;
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
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
