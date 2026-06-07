import { NextResponse } from "next/server";
import { API_URL } from "@/lib/config";
import { getAuthToken } from "@/lib/server-auth";

export const runtime = "nodejs";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "content-encoding",
  "transfer-encoding",
  "keep-alive",
  "host",
]);

async function forward(req: Request, segments: string[]): Promise<Response> {
  const token = await getAuthToken();
  const path = segments.join("/");
  const search = new URL(req.url).search;
  const target = `${API_URL}/${path}${search}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  if (token) headers.set("Authorization", `Bearer ${token}`);

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

  return new NextResponse(respuesta.body, {
    status: respuesta.status,
    headers: responseHeaders,
  });
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
