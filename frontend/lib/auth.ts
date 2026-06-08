export type UserRole = "Administrador" | "Veterinario" | "Cliente";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export async function fetchMe(): Promise<AuthUser> {
  const res = await fetch("/api/backend/auth/me", { credentials: "include" });
  if (!res.ok) throw new Error("No se pudo obtener el perfil del usuario.");
  return res.json();
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}

async function postAuth(path: string, data: unknown): Promise<{ user?: AuthUser; error?: string }> {
  try {
    const res = await fetch(`/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (res.status === 429)
      return { error: "Demasiados intentos. Intenta de nuevo en unos minutos." };
    const json = await res.json();
    if (!res.ok) {
      const msg = Array.isArray(json.message) ? json.message[0] : json.message;
      return { error: msg ?? "No se pudo completar la solicitud." };
    }
    return { user: json.user };
  } catch {
    return { error: "No se pudo conectar con el servidor." };
  }
}

export async function registerUser(data: {
  nombre: string;
  email: string;
  password: string;
  rol?: string;
}): Promise<{ user?: AuthUser; error?: string }> {
  return postAuth("register", data);
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user?: AuthUser; error?: string }> {
  return postAuth("login", { email, password });
}

export async function loginOrRegisterGoogle(data: {
  credential: string;
}): Promise<{ user?: AuthUser; error?: string }> {
  return postAuth("google", data);
}

export type ForgotPasswordOutcome = "sent" | "rate-limited" | "error";

export async function forgotPassword(email: string): Promise<ForgotPasswordOutcome> {
  try {
    const res = await fetch("/api/backend/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });
    if (res.status === 429) return "rate-limited";
    if (res.status >= 500) return "error";
    // Siempre "sent" para 2xx/4xx — nunca revelar si el email existe o no
    return "sent";
  } catch {
    return "error";
  }
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch("/api/backend/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token, password }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      const msg = Array.isArray(json.message) ? json.message[0] : json.message;
      return { ok: false, message: msg || "Error al restablecer la contraseña." };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      message: "No se pudo restablecer la contraseña. El enlace puede haber expirado.",
    };
  }
}
