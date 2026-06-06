/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach } from "vitest";
import { getToken, setToken, clearCurrentUser, getCurrentUser } from "../auth";

const TOKEN_KEY = "vetnova-token";

function b64(obj: object): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}

function makeJWT(payload: object, expOffsetSeconds = 3600): string {
  const header = b64({ alg: "HS256", typ: "JWT" });
  const body = b64({ ...payload, exp: Math.floor(Date.now() / 1000) + expOffsetSeconds });
  return `${header}.${body}.fake-sig`;
}

beforeEach(() => {
  localStorage.clear();
  document.cookie = `${TOKEN_KEY}=; max-age=0`;
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
