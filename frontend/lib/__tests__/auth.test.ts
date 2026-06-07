/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach, vi } from "vitest";
import { fetchMe, logout, registerUser, loginUser, loginOrRegisterGoogle } from "../auth";

function mockFetch(status: number, body: unknown, ok = status >= 200 && status < 300) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      status,
      json: () => Promise.resolve(body),
    }),
  );
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchMe", () => {
  it("returns the user when the request succeeds", async () => {
    mockFetch(200, { id: 1, name: "Ana", email: "ana@test.com", role: "Cliente" });
    const user = await fetchMe();
    expect(user.name).toBe("Ana");
  });

  it("throws when the request fails", async () => {
    mockFetch(401, {}, false);
    await expect(fetchMe()).rejects.toThrow("No se pudo obtener el perfil del usuario.");
  });
});

describe("logout", () => {
  it("calls the logout endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => ({}) });
    vi.stubGlobal("fetch", fetchMock);
    await logout();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.objectContaining({ method: "POST" }),
    );
  });
});

describe("registerUser", () => {
  it("returns the user on success", async () => {
    mockFetch(201, { user: { id: 1, name: "Ana", email: "ana@test.com", role: "Cliente" } });
    const result = await registerUser({
      nombre: "Ana",
      email: "ana@test.com",
      password: "pass123",
    });
    expect(result.user?.id).toBe(1);
    expect(result.error).toBeUndefined();
  });

  it("returns error message on 4xx", async () => {
    mockFetch(409, { message: "El email ya está registrado" }, false);
    const result = await registerUser({ nombre: "Ana", email: "dup@test.com", password: "pass" });
    expect(result.error).toBe("El email ya está registrado");
  });

  it("returns first item when message is array", async () => {
    mockFetch(400, { message: ["nombre requerido", "otro error"] }, false);
    const result = await registerUser({ nombre: "", email: "x@x.com", password: "p" });
    expect(result.error).toBe("nombre requerido");
  });

  it("returns rate-limit message on 429", async () => {
    mockFetch(429, {}, false);
    const result = await registerUser({ nombre: "X", email: "x@x.com", password: "p" });
    expect(result.error).toBe("Demasiados intentos. Intenta de nuevo en unos minutos.");
  });

  it("returns network error when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const result = await registerUser({ nombre: "X", email: "x@x.com", password: "p" });
    expect(result.error).toBe("No se pudo conectar con el servidor.");
  });
});

describe("loginUser", () => {
  it("returns the user on success", async () => {
    mockFetch(200, { user: { id: 1, name: "Ana", email: "ana@test.com", role: "Cliente" } });
    const result = await loginUser("ana@test.com", "pass123");
    expect(result.user?.email).toBe("ana@test.com");
  });

  it("returns error on invalid credentials", async () => {
    mockFetch(401, { message: "Credenciales incorrectas." }, false);
    const result = await loginUser("wrong@test.com", "bad");
    expect(result.error).toBe("Credenciales incorrectas.");
  });

  it("returns network error when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const result = await loginUser("a@b.com", "p");
    expect(result.error).toBe("No se pudo conectar con el servidor.");
  });
});

describe("loginOrRegisterGoogle", () => {
  it("returns the user on success", async () => {
    mockFetch(200, { user: { id: 1, name: "Ana", email: "ana@test.com", role: "Cliente" } });
    const result = await loginOrRegisterGoogle({ credential: "fake.jwt.token" });
    expect(result.user?.id).toBe(1);
  });

  it("returns error on server failure", async () => {
    mockFetch(500, { message: "Error interno" }, false);
    const result = await loginOrRegisterGoogle({ credential: "fake.jwt.token" });
    expect(result.error).toBe("Error interno");
  });

  it("returns network error when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const result = await loginOrRegisterGoogle({ credential: "fake.jwt.token" });
    expect(result.error).toBe("No se pudo conectar con el servidor.");
  });
});
