import { SignJWT } from "jose";
import type { Page } from "@playwright/test";

export type UserRole = "SuperAdministrador" | "Administrador" | "Veterinario" | "Cliente";

const ROLE_HOME: Record<UserRole, string> = {
  SuperAdministrador: "/super-admin",
  Administrador: "/admin",
  Veterinario: "/veterinario",
  Cliente: "/cliente",
};

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET no está definido — requerido para firmar JWTs válidos en tests e2e " +
        "(debe coincidir con el secreto usado por el backend, ver .env.local)",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function makeSignedJWT(
  sub: number,
  role: UserRole,
  name: string,
  email: string,
  expiresInSeconds = 86400,
): Promise<string> {
  return new SignJWT({ sub: String(sub), role, name, email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(getSecretKey());
}

/**
 * El backend NestJS no vive en este repo y no está disponible en este entorno
 * de pruebas. Sin esto, /api/backend/auth/me falla y `useAuth().user` queda en
 * null para siempre, lo que rompe cualquier página que dependa del usuario
 * autenticado (nombre mostrado, formularios, etc.) aunque el middleware ya
 * haya dejado pasar la cookie. Estos mocks devuelven respuestas vacías/válidas
 * por defecto para que esas páginas terminen de cargar de forma determinista.
 */
export async function mockBackendDefaults(
  page: Page,
  opts: { sub: number; role: UserRole; name: string; email: string },
): Promise<void> {
  await page.route("**/api/backend/**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.replace(/^.*\/api\/backend/, "");
    const method = req.method();

    if (path === "/auth/me" && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: opts.sub,
          name: opts.name,
          email: opts.email,
          role: opts.role,
          clinicaId: null,
        }),
      });
    }
    if (path === "/propietarios" && method === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    }
    if (path === "/mascotas" && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [], total: 0, lastPage: 1 }),
      });
    }
    if (path === "/citas" && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [], total: 0, page: 1, lastPage: 1 }),
      });
    }
    if (path === "/usuarios" && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [], total: 0, lastPage: 1 }),
      });
    }
    if (path.startsWith("/usuarios/") && method === "PUT") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: opts.sub, nombre: opts.name, email: opts.email }),
      });
    }
    if (path === "/notificaciones/count" && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ count: 0 }),
      });
    }
    if (path === "/notificaciones" && method === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    }
    if (path === "/notificaciones/leer-todas" && method === "PATCH") {
      return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    }
    if (path.startsWith("/notificaciones/") && path.endsWith("/leer") && method === "PATCH") {
      return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    }
    // Cualquier otro endpoint del backend: nunca dejar pasar un 401/403 real,
    // porque apiFetch hace window.location.href = "/login" en cualquier 401
    // y eso rompería los tests de forma no determinista según haya o no un
    // backend real corriendo en este entorno.
    if (method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [], total: 0, lastPage: 1 }),
      });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  // El logout real reenvía la petición al backend ausente; lo resolvemos
  // directamente para no depender de él en los tests.
  await page.route("**/api/auth/logout", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
  );
}

export async function injectAuthAs(
  page: Page,
  role: UserRole,
  sub: number,
  name: string,
  email: string,
): Promise<void> {
  const token = await makeSignedJWT(sub, role, name, email);
  await page.context().addCookies([
    {
      name: "vetnova-token",
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false, // dev usa http
      sameSite: "Strict",
      expires: Math.floor(Date.now() / 1000) + 86400,
    },
  ]);
  await mockBackendDefaults(page, { sub, role, name, email });
}

export function roleHome(role: UserRole): string {
  return ROLE_HOME[role];
}
