import { vi, describe, it, expect, beforeEach } from "vitest";

const mockSet = vi.fn();
const mockDelete = vi.fn();
const mockGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    set: mockSet,
    delete: mockDelete,
    get: mockGet,
  }),
}));

function makeToken(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.fake-signature`;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("setAuthCookie", () => {
  it("guarda el token como cookie httpOnly con SameSite=strict", async () => {
    const { setAuthCookie } = await import("../server-auth");
    const token = makeToken({ sub: 1, exp: Math.floor(Date.now() / 1000) + 3600 });

    await setAuthCookie(token);

    expect(mockSet).toHaveBeenCalledWith(
      "vetnova-token",
      token,
      expect.objectContaining({ httpOnly: true, sameSite: "strict", path: "/" }),
    );
  });

  it("calcula maxAge a partir del exp del token", async () => {
    vi.useFakeTimers();
    try {
      const now = Math.floor(Date.now() / 1000);
      vi.setSystemTime(now * 1000);
      const { setAuthCookie } = await import("../server-auth");
      const token = makeToken({ sub: 1, exp: now + 1000 });

      await setAuthCookie(token);

      expect(mockSet).toHaveBeenCalledWith(
        "vetnova-token",
        token,
        expect.objectContaining({ maxAge: 1000 }),
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("no incluye maxAge cuando el token no tiene exp decodificable", async () => {
    const { setAuthCookie } = await import("../server-auth");

    await setAuthCookie("token-invalido-sin-formato-jwt");

    const [, , options] = mockSet.mock.calls[0];
    expect(options).not.toHaveProperty("maxAge");
  });

  it("marca la cookie como Secure solo en producción", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { setAuthCookie } = await import("../server-auth");

    await setAuthCookie(makeToken({ sub: 1, exp: Math.floor(Date.now() / 1000) + 60 }));

    expect(mockSet).toHaveBeenCalledWith(
      "vetnova-token",
      expect.any(String),
      expect.objectContaining({ secure: true }),
    );
  });

  it("no marca la cookie como Secure en desarrollo", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const { setAuthCookie } = await import("../server-auth");

    await setAuthCookie(makeToken({ sub: 1, exp: Math.floor(Date.now() / 1000) + 60 }));

    expect(mockSet).toHaveBeenCalledWith(
      "vetnova-token",
      expect.any(String),
      expect.objectContaining({ secure: false }),
    );
  });
});

describe("clearAuthCookie", () => {
  it("elimina la cookie de autenticación", async () => {
    const { clearAuthCookie } = await import("../server-auth");

    await clearAuthCookie();

    expect(mockDelete).toHaveBeenCalledWith("vetnova-token");
  });
});

describe("getAuthToken", () => {
  it("devuelve el valor de la cookie cuando existe", async () => {
    mockGet.mockReturnValue({ value: "un-token-valido" });
    const { getAuthToken } = await import("../server-auth");

    expect(await getAuthToken()).toBe("un-token-valido");
    expect(mockGet).toHaveBeenCalledWith("vetnova-token");
  });

  it("devuelve null cuando la cookie no existe", async () => {
    mockGet.mockReturnValue(undefined);
    const { getAuthToken } = await import("../server-auth");

    expect(await getAuthToken()).toBeNull();
  });
});
