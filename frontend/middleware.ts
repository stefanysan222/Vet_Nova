import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { API_URL } from "./lib/config";

type UserRole = "SuperAdministrador" | "Administrador" | "Veterinario" | "Cliente";

const ROLE_REQUIRED: Record<string, UserRole> = {
  "/super-admin": "SuperAdministrador",
  "/admin": "Administrador",
  "/veterinario": "Veterinario",
  "/cliente": "Cliente",
};

const ROLE_HOME: Record<UserRole, string> = {
  SuperAdministrador: "/super-admin",
  Administrador: "/admin",
  Veterinario: "/veterinario",
  Cliente: "/cliente",
};

const PROTECTED_PREFIXES = Object.keys(ROLE_REQUIRED);

type TokenPayload = { sub: string; role: UserRole; exp: number };

const JWT_SECRET = process.env.JWT_SECRET ? new TextEncoder().encode(process.env.JWT_SECRET) : null;

async function verifyToken(token: string): Promise<TokenPayload | null> {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET no está configurado: no se puede verificar la firma del token");
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

function buildCsp(nonce: string): string {
  // En dev, webpack/Turbopack usan eval() para HMR y carga de módulos; sin
  // 'unsafe-eval' la app nunca hidrata (ningún botón/formulario responde) y
  // no aparece ningún error visible más que un CSP violation en consola.
  // En producción no se usa eval() en el bundle del cliente, así que el CSP
  // se mantiene estricto.
  const scriptSrc =
    process.env.NODE_ENV === "production"
      ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://accounts.google.com`
      : `script-src 'self' 'unsafe-eval' 'nonce-${nonce}' 'strict-dynamic' https://accounts.google.com`;

  return [
    "default-src 'self'",
    scriptSrc,
    // fonts.googleapis.com: hoja de estilos que el propio Google Maps JS API
    // inyecta para su UI (controles, info windows) — no es nuestro CSS.
    "style-src 'self' 'unsafe-inline' https://accounts.google.com https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com https://maps.gstatic.com https://maps.googleapis.com",
    // El WebSocket de notificaciones en tiempo real (HP-02) se conecta directo
    // al backend con ws(s)://, no http(s)://, así que ambos esquemas deben
    // estar permitidos o la conexión queda bloqueada silenciosamente.
    // maps.googleapis.com: tiles/telemetría del mapa interactivo (Google Maps JS API).
    `connect-src 'self' ${API_URL} ${API_URL.replace(/^http/, "ws")} https://accounts.google.com https://api.cloudinary.com https://maps.googleapis.com`,
    // fonts.gstatic.com: archivos de fuente que sirve la hoja de estilos de arriba.
    "font-src 'self' https://fonts.gstatic.com",
    "frame-src https://accounts.google.com https://maps.google.com https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected) {
    const token = request.cookies.get("vetnova-token")?.value ?? null;

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = await verifyToken(token);

    if (!payload) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("vetnova-token");
      return response;
    }

    const requiredRole = Object.entries(ROLE_REQUIRED).find(([route]) =>
      pathname.startsWith(route),
    )?.[1];

    if (requiredRole && payload.role !== requiredRole) {
      const home = ROLE_HOME[payload.role] ?? "/login";
      return NextResponse.redirect(new URL(home, request.url));
    }
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
