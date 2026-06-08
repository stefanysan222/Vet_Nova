import { vi, describe, it, expect, beforeEach } from "vitest";

const mockRateLimit = vi.fn();
const mockGetAuthToken = vi.fn();
const mockFetch = vi.fn();

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
}));

vi.mock("@/lib/server-auth", () => ({
  getAuthToken: () => mockGetAuthToken(),
}));

function buildRequest() {
  const formData = new FormData();
  formData.append("file", new File(["contenido"], "foto.png", { type: "image/png" }));
  return new Request("http://localhost/api/cloudinary/upload", {
    method: "POST",
    body: formData,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.stubEnv("CLOUDINARY_CLOUD_NAME", "demo");
  vi.stubEnv("CLOUDINARY_API_KEY", "key");
  vi.stubEnv("CLOUDINARY_API_SECRET", "secret");
  mockRateLimit.mockResolvedValue(true);
  mockGetAuthToken.mockResolvedValue("un-token-valido");
  mockFetch.mockReset();
  vi.stubGlobal("fetch", mockFetch);
});

function mockMeResponse(ok: boolean, body: unknown = { id: 7, role: "Cliente" }) {
  mockFetch.mockImplementationOnce(async (url: string) => {
    expect(url).toContain("/auth/me");
    return { ok, json: async () => body };
  });
}

describe("POST /api/cloudinary/upload", () => {
  it("responde 401 si no hay sesión (sin cookie de autenticación)", async () => {
    mockGetAuthToken.mockResolvedValue(null);
    const { POST } = await import("../route");
    const res = await POST(buildRequest());
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Debes iniciar sesión para subir archivos.");
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockRateLimit).not.toHaveBeenCalled();
  });

  it("responde 401 si la sesión es inválida o expiró", async () => {
    mockMeResponse(false);
    const { POST } = await import("../route");
    const res = await POST(buildRequest());
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Sesión expirada. Inicia sesión nuevamente.");
    expect(mockRateLimit).not.toHaveBeenCalled();
  });

  it("aplica el límite de subidas por usuario autenticado, no por IP", async () => {
    mockMeResponse(true, { id: 42, role: "Cliente" });
    mockRateLimit.mockResolvedValue(false);
    const { POST } = await import("../route");
    const res = await POST(buildRequest());
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json.error).toBe("Demasiadas subidas. Intenta en un minuto.");
    expect(mockRateLimit).toHaveBeenCalledWith("upload:42", 10, 60_000);
  });
});
