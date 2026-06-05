export type UserRole = "Administrador" | "Veterinario" | "Cliente";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

const TOKEN_KEY = "vetnova-token";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearCurrentUser() {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("vetnova_cliente_perfil");
}

function decodeToken(token: string): { sub: number; name: string; email: string; role: UserRole; exp: number } | null {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join("")
      )
    );
  } catch {
    return null;
  }
}

export function getCurrentUser(): AuthUser | null {
  const token = getToken();
  if (!token) return null;
  const decoded = decodeToken(token);
  if (!decoded) return null;
  if (decoded.exp * 1000 < Date.now()) {
    clearCurrentUser();
    return null;
  }
  return {
    id: decoded.sub,
    name: decoded.name,
    email: decoded.email,
    role: decoded.role,
  };
}

const API_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function registerUser(data: {
  nombre: string;
  email: string;
  password: string;
  rol?: string;
}): Promise<{ token?: string; user?: AuthUser; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      const msg = Array.isArray(json.message) ? json.message[0] : json.message;
      return { error: msg ?? "Error al registrar usuario." };
    }
    return { token: json.token, user: json.user };
  } catch {
    return { error: "No se pudo conectar con el servidor." };
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ token?: string; user?: AuthUser; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) {
      const msg = Array.isArray(json.message) ? json.message[0] : json.message;
      return { error: msg ?? "Credenciales incorrectas." };
    }
    return { token: json.token, user: json.user };
  } catch {
    return { error: "No se pudo conectar con el servidor." };
  }
}

export async function loginOrRegisterGoogle(profile: {
  name: string;
  email: string;
  picture?: string;
}): Promise<{ token?: string; user?: AuthUser; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const json = await res.json();
    if (!res.ok) {
      const msg = Array.isArray(json.message) ? json.message[0] : json.message;
      return { error: msg ?? "Error con autenticación de Google." };
    }
    return { token: json.token, user: json.user };
  } catch {
    return { error: "No se pudo conectar con el servidor." };
  }
}
