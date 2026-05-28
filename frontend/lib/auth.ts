export type UserRole = "Administrador" | "Veterinario" | "Cliente" | "Recepcionista";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  provider: "local" | "google";
  picture?: string;
}

const USERS_KEY = "vetnova-users";
const CURRENT_USER_KEY = "vetnova-current-user";

function isBrowser() {
  return typeof window !== "undefined";
}

function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getStoredUsers(): AuthUser[] {
  return readStorage<AuthUser[]>(USERS_KEY, []);
}

export function saveStoredUsers(users: AuthUser[]) {
  writeStorage<AuthUser[]>(USERS_KEY, users);
}

export function getCurrentUser(): AuthUser | null {
  return readStorage<AuthUser | null>(CURRENT_USER_KEY, null);
}

export function setCurrentUser(user: AuthUser) {
  writeStorage<AuthUser>(CURRENT_USER_KEY, user);
}

export function clearCurrentUser() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(CURRENT_USER_KEY);
}

function generateId() {
  if (isBrowser() && typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  provider?: "local" | "google";
  picture?: string;
}): { user?: AuthUser; error?: string } {
  const users = getStoredUsers();
  const normalizedEmail = data.email.trim().toLowerCase();
  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    return { error: "Ya existe una cuenta con ese correo." };
  }

  const user: AuthUser = {
    id: generateId(),
    name: data.name.trim(),
    email: normalizedEmail,
    password: data.provider === "google" ? undefined : data.password,
    role: data.role,
    provider: data.provider ?? "local",
    picture: data.picture,
  };

  saveStoredUsers([user, ...users]);
  return { user };
}

export function loginUser(email: string, password: string): { user?: AuthUser; error?: string } {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((item) => item.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return { error: "No existe una cuenta con ese correo." };
  }

  if (user.provider === "google") {
    return { error: "Esta cuenta está registrada con Google. Usa el botón de Google para iniciar sesión." };
  }

  if (user.password !== password) {
    return { error: "Contraseña incorrecta." };
  }

  return { user };
}

export function loginOrRegisterGoogle(profile: {
  name: string;
  email: string;
  picture?: string;
}): { user: AuthUser } {
  const users = getStoredUsers();
  const normalizedEmail = profile.email.trim().toLowerCase();
  const existing = users.find((item) => item.email.toLowerCase() === normalizedEmail);

  if (existing) {
    return { user: existing };
  }

  const user: AuthUser = {
    id: generateId(),
    name: profile.name,
    email: normalizedEmail,
    role: "Cliente",
    provider: "google",
    picture: profile.picture,
  };

  saveStoredUsers([user, ...users]);
  return { user };
}
