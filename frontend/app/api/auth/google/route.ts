import { NextResponse } from "next/server";
import { API_URL } from "@/lib/config";
import { setAuthCookie } from "@/lib/server-auth";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!(await rateLimit(`auth-google:${ip}`, 5, 60_000))) {
    return NextResponse.json(
      { error: "Demasiados intentos. Intenta de nuevo en unos minutos." },
      { status: 429 },
    );
  }

  const body = await req.text();

  const respuesta = await fetch(`${API_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const json = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    return NextResponse.json(json, { status: respuesta.status });
  }

  if (json.token) {
    await setAuthCookie(json.token);
  }

  return NextResponse.json({ user: json.user });
}
