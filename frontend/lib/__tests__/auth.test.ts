/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getToken,
  setToken,
  clearCurrentUser,
  getCurrentUser,
  registerUser,
  loginUser,
  loginOrRegisterGoogle,
} from "../auth";

const TOKEN_KEY = "vetnova-token";

function b64(obj: object): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}

function makeJWT(payload: object, expOffsetSeconds = 3600): string {
  const header = b64({ alg: "HS256", typ: "JWT" });
  const body = b64({ ...payload, exp: Math.floor(Date.now() / 1000) + expOffsetSeconds });
  return `${header}.${body}.fake-sig`;
}

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
  localStorage.clear();
  sessionStorage.clear();
  document.cookie = `${TOKEN_KEY}=; max-age=0`;
  vi.unstubAllGlobals();
});

describe("getToken", () => {
  it("returns null when no token stored", () => {
    expect(getToken()).toBeNull();
  });

  it("returns token after setToken", () => {
    setToken("abc.def.ghi");
    expect(getToken()).toBe("abc.def.ghi");
  });
});

describe("setToken", () => {
  it("persists token in localStorage", () => {
    setToken("my.token.value");
    expect(localStorage.getItem(TOKEN_KEY)).toBe("my.token.value");
  });

  it("also writes cookie for middleware", () => {
    setToken("my.token.value");
    expect(document.cookie).toContain("vetnova-token=my.token.value");
  });

  it("uses sessionStorage when remember=false", () => {
    setToken("session.only.token", false);
    expect(sessionStorage.getItem(TOKEN_KEY)).toBe("session.only.token");
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});

describe("clearCurrentUser", () => {
  it("removes token from localStorage", () => {
    setToken("abc.def.ghi");
    clearCurrentUser();
    expect(getToken()).toBeNull();
  });

  it("removes cookie", () => {
    setToken("abc.def.ghi");
    clearCurrentUser();
    expect(document.cookie).not.toContain("vetnova-token=abc");
  });
});

describe("getCurrentUser", () => {
  it("returns null when no token", () => {
    expect(getCurrentUser()).toBeNull();
  });

  it("returns user from valid token", () => {
    const token = makeJWT({ sub: 1, name: "Ana García", email: "ana@test.com", role: "Cliente" });
    setToken(token);
    const user = getCurrentUser();
    expect(user).not.toBeNull();
    expect(user?.name).toBe("Ana García");
    expect(user?.role).toBe("Cliente");
    expect(user?.email).toBe("ana@test.com");
  });

  it("returns null and clears token when expired", () => {
    const token = makeJWT({ sub: 1, name: "Ana", email: "ana@test.com", role: "Cliente" }, -10);
    setToken(token);
    expect(getCurrentUser()).toBeNull();
    expect(getToken()).toBeNull();
  });

  it("returns null for malformed token", () => {
    setToken("not.a.valid.jwt.at.all");
    expect(getCurrentUser()).toBeNull();
  });
});

describe("registerUser", () => {
  it("returns token on success", async () => {
    mockFetch(201, { token: "tok.abc.123", user: { id: 1 } });
    const result = await registerUser({
      nombre: "Ana",
      email: "ana@test.com",
      password: "pass123",
    });
    expect(result.token).toBe("tok.abc.123");
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

  it("returns network error when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const result = await registerUser({ nombre: "X", email: "x@x.com", password: "p" });
    expect(result.error).toBe("No se pudo conectar con el servidor.");
  });
});

describe("loginUser", () => {
  it("returns token on success", async () => {
    mockFetch(200, { token: "login.tok.xyz" });
    const result = await loginUser("ana@test.com", "pass123");
    expect(result.token).toBe("login.tok.xyz");
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
  it("returns token on success", async () => {
    mockFetch(200, { token: "google.tok.abc" });
    const result = await loginOrRegisterGoogle({ name: "Ana", email: "ana@gmail.com" });
    expect(result.token).toBe("google.tok.abc");
  });

  it("returns error on server failure", async () => {
    mockFetch(500, { message: "Error interno" }, false);
    const result = await loginOrRegisterGoogle({ name: "Ana", email: "ana@gmail.com" });
    expect(result.error).toBe("Error interno");
  });

  it("returns network error when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const result = await loginOrRegisterGoogle({ name: "X", email: "x@x.com" });
    expect(result.error).toBe("No se pudo conectar con el servidor.");
  });
});
