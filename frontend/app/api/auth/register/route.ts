import { NextResponse } from "next/server";
import { API_URL } from "@/lib/config";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!(await rateLimit(`auth-register:${ip}`, 5, 60_000))) {
    return NextResponse.json(
      { error: "Demasiados intentos. Intenta de nuevo en unos minutos." },
      { status: 429 },
    );
  }

  const body = await req.text();

  const respuesta = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const json = await respuesta.json().catch(() => ({}));

  const response = NextResponse.json(json, { status: respuesta.status });
  for (const cookie of respuesta.headers.getSetCookie()) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}
