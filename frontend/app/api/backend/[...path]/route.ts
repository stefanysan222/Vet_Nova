import { NextResponse } from "next/server";
import { API_URL } from "@/lib/config";

export const runtime = "nodejs";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "content-encoding",
  "transfer-encoding",
  "keep-alive",
  "host",
  "set-cookie",
]);

async function forward(req: Request, segments: string[]): Promise<Response> {
  const path = segments.join("/");
  const search = new URL(req.url).search;
  const target = `${API_URL}/${path}${search}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  const csrfToken = req.headers.get("x-csrf-token");
  if (csrfToken) headers.set("x-csrf-token", csrfToken);

  const hasBody = req.method !== "GET" && req.method !== "HEAD";

  const respuesta = await fetch(target, {
    method: req.method,
    headers,
    body: hasBody ? await req.arrayBuffer() : undefined,
  });

  const responseHeaders = new Headers();
  respuesta.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  const response = new NextResponse(respuesta.body, {
    status: respuesta.status,
    headers: responseHeaders,
  });
  for (const setCookie of respuesta.headers.getSetCookie()) {
    response.headers.append("set-cookie", setCookie);
  }
  return response;
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(req: Request, ctx: RouteContext) {
  return forward(req, (await ctx.params).path);
}

export async function POST(req: Request, ctx: RouteContext) {
  return forward(req, (await ctx.params).path);
}

export async function PUT(req: Request, ctx: RouteContext) {
  return forward(req, (await ctx.params).path);
}

export async function PATCH(req: Request, ctx: RouteContext) {
  return forward(req, (await ctx.params).path);
}

export async function DELETE(req: Request, ctx: RouteContext) {
  return forward(req, (await ctx.params).path);
}
