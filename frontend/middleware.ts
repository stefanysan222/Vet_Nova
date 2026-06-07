import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { API_URL } from "./lib/config";

type UserRole = "Administrador" | "Veterinario" | "Cliente";

const ROLE_REQUIRED: Record<string, UserRole> = {
  "/admin": "Administrador",
  "/veterinario": "Veterinario",
  "/cliente": "Cliente",
};

const ROLE_HOME: Record<UserRole, string> = {
  Administrador: "/admin",
  Veterinario: "/veterinario",
  Cliente: "/cliente",
};

const PROTECTED_PREFIXES = Object.keys(ROLE_REQUIRED);

function decodeToken(token: string): { sub: number; role: UserRole; exp: number } | null {
  try {
    const raw = token.split(".")[1];
    if (!raw) return null;
    const json = Buffer.from(raw, "base64url").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://accounts.google.com`,
    "style-src 'self' 'unsafe-inline' https://accounts.google.com",
    "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com",
    `connect-src 'self' ${API_URL} https://api.emailjs.com https://accounts.google.com https://api.cloudinary.com`,
    "font-src 'self'",
    "frame-src https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected) {
    const token =
      request.cookies.get("vetnova-token")?.value ?? request.headers.get("x-vetnova-token") ?? null;

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = decodeToken(token);

    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (payload.exp * 1000 < Date.now()) {
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
