import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // El token puede venir de cookie (futuro) o del header Authorization
  const token =
    request.cookies.get("vetnova-token")?.value ??
    request.headers.get("x-vetnova-token") ??
    null;

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
    pathname.startsWith(route)
  )?.[1];

  if (requiredRole && payload.role !== requiredRole) {
    const home = ROLE_HOME[payload.role] ?? "/login";
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/veterinario/:path*", "/cliente/:path*"],
};
