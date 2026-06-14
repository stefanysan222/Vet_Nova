import { NextResponse } from "next/server";
import { API_URL } from "@/lib/config";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie");

  const respuesta = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: cookie ? { cookie } : {},
  });

  const json = await respuesta.json().catch(() => ({}));

  const response = NextResponse.json(json, { status: respuesta.status });
  for (const setCookie of respuesta.headers.getSetCookie()) {
    response.headers.append("set-cookie", setCookie);
  }
  return response;
}
