import { vi, describe, it, expect, beforeEach } from "vitest";

const mockRateLimit = vi.fn();
const mockFetch = vi.fn();

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
}));

// jsdom no soporta `Request.formData()` con un body FormData real, así que
// stubeamos `formData()` directamente devolviendo un objeto con `.get()`.
function buildRequest(file?: File, cookie: string | null = "vetnova-token=un-token-valido") {
  const archivo = file ?? new File(["contenido"], "foto.png", { type: "image/png" });
  return {
    headers: new Headers(cookie ? { cookie } : {}),
    formData: async () => ({
      get: (key: string) => (key === "file" ? archivo : null),
    }),
  } as unknown as Request;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.stubEnv("CLOUDINARY_CLOUD_NAME", "demo");
  vi.stubEnv("CLOUDINARY_API_KEY", "key");
  vi.stubEnv("CLOUDINARY_API_SECRET", "secret");
  mockRateLimit.mockResolvedValue(true);
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
    const { POST } = await import("../route");
    const res = await POST(buildRequest(undefined, null));
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

  it("rechaza tipos de archivo no permitidos", async () => {
    mockMeResponse(true);
    const archivo = new File(["contenido"], "doc.pdf", { type: "application/pdf" });
    const { POST } = await import("../route");
    const res = await POST(buildRequest(archivo));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Tipo de archivo no permitido. Usa JPG, PNG o WEBP.");
    expect(mockFetch).toHaveBeenCalledTimes(1); // solo la llamada a /auth/me
  });

  it("rechaza archivos que superan el tamaño máximo", async () => {
    mockMeResponse(true);
    const contenidoGrande = new Uint8Array(5 * 1024 * 1024 + 1);
    const archivo = new File([contenidoGrande], "foto.png", { type: "image/png" });
    const { POST } = await import("../route");
    const res = await POST(buildRequest(archivo));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("El archivo supera el tamaño máximo de 5MB.");
    expect(mockFetch).toHaveBeenCalledTimes(1); // solo la llamada a /auth/me
  });
});
