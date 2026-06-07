import { NextResponse } from "next/server";
import { API_URL } from "@/lib/config";
import { setAuthCookie } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();

  const respuesta = await fetch(`${API_URL}/auth/register`, {
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
