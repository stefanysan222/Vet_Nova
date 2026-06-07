import { cookies } from "next/headers";

export const TOKEN_COOKIE = "vetnova-token";

function decodeExp(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const json = Buffer.from(payload, "base64url").toString("utf-8");
    const { exp } = JSON.parse(json) as { exp?: number };
    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const exp = decodeExp(token);
  const maxAge = exp ? Math.max(exp - Math.floor(Date.now() / 1000), 0) : undefined;
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    ...(maxAge !== undefined ? { maxAge } : {}),
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE)?.value ?? null;
}
