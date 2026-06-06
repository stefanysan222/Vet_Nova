/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach, vi } from "vitest";
import { apiFetch, api } from "../api/client";

const TOKEN_KEY = "vetnova-token";

function b64(obj: object): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}

function makeJWT(payload: object): string {
  const header = b64({ alg: "HS256", typ: "JWT" });
  const body = b64({ ...payload, exp: Math.floor(Date.now() / 1000) + 3600 });
  return `${header}.${body}.fake-sig`;
}

function mockFetch(status: number, body: unknown, ok = status >= 200 && status < 300) {
  const responseBody = typeof body === "string" ? body : JSON.stringify(body);
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      status,
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(responseBody),
    }),
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("apiFetch — success", () => {
  it("returns parsed JSON on 2xx", async () => {
    mockFetch(200, { id: 1, name: "Test" });
    const result = await apiFetch<{ id: number; name: string }>("/test");
    expect(result).toEqual({ id: 1, name: "Test" });
  });

  it("sends Content-Type application/json", async () => {
    mockFetch(200, {});
    await apiFetch("/test");
    const headers = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("sends Authorization header when token is present", async () => {
    const token = makeJWT({ sub: 1, name: "Ana", email: "a@b.com", role: "Cliente" });
    localStorage.setItem(TOKEN_KEY, token);
    mockFetch(200, {});
    await apiFetch("/test");
    const headers = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
    expect(headers["Authorization"]).toBe(`Bearer ${token}`);
  });

  it("omits Authorization header when no token", async () => {
    mockFetch(200, {});
    await apiFetch("/test");
    const headers = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
    expect(headers["Authorization"]).toBeUndefined();
  });

  it("merges caller headers with defaults", async () => {
    mockFetch(200, {});
    await apiFetch("/test", { headers: { "X-Custom": "yes" } });
    const headers = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
    expect(headers["X-Custom"]).toBe("yes");
    expect(headers["Content-Type"]).toBe("application/json");
  });
});

describe("apiFetch — error handling", () => {
  it("throws on 401 and clears session", async () => {
    localStorage.setItem(TOKEN_KEY, makeJWT({ sub: 1 }));
    mockFetch(401, { message: "Unauthorized" }, false);
    await expect(apiFetch("/secure")).rejects.toThrow("Sesión expirada");
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("throws on 403 with permission message", async () => {
    mockFetch(403, {}, false);
    await expect(apiFetch("/admin")).rejects.toThrow("No tienes permiso");
  });

  it("extracts message from JSON error body", async () => {
    mockFetch(400, { message: "Campo requerido" }, false);
    await expect(apiFetch("/resource")).rejects.toThrow("Campo requerido");
  });

  it("extracts first message when message is an array", async () => {
    mockFetch(422, { message: ["error1", "error2"] }, false);
    await expect(apiFetch("/resource")).rejects.toThrow("error1");
  });

  it("uses status code as message when body is non-JSON text", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error("not json")),
        text: () => Promise.resolve(""),
      }),
    );
    await expect(apiFetch("/crash")).rejects.toThrow("Error 500");
  });
});

describe("api shorthand methods", () => {
  it("api.get calls apiFetch with GET", async () => {
    mockFetch(200, []);
    await api.get("/items");
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]).toContain("/items");
  });

  it("api.post sends method POST with JSON body", async () => {
    mockFetch(201, { id: 2 });
    await api.post("/items", { name: "nuevo" });
    const [, opts] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(opts.method).toBe("POST");
    expect(opts.body).toBe(JSON.stringify({ name: "nuevo" }));
  });

  it("api.put sends method PUT", async () => {
    mockFetch(200, { id: 2 });
    await api.put("/items/2", { name: "editado" });
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].method).toBe("PUT");
  });

  it("api.delete sends method DELETE", async () => {
    mockFetch(200, {});
    await api.delete("/items/2");
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].method).toBe("DELETE");
  });
});
