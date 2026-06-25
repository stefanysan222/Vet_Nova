import { vi, describe, it, expect, beforeEach } from "vitest";

const mockRateLimit = vi.fn();
const mockSend = vi.fn();

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: (...args: unknown[]) => mockSend(...args) };
  },
}));

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/email/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const CAMPOS_VALIDOS = {
  nombre: "Lorena Romero",
  email: "lorena@test.com",
  asunto: "Consulta general",
  mensaje: "Hola, tengo una pregunta sobre mi cita.",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.stubEnv("RESEND_API_KEY", "re_test_key");
  vi.stubEnv("SUPPORT_INBOX", "suportvetnova@gmail.com");
  mockRateLimit.mockResolvedValue(true);
  mockSend.mockResolvedValue({ data: { id: "test-id" }, error: null });
});

describe("POST /api/email/contact", () => {
  it("envía el mensaje vía Resend y responde ok", async () => {
    const { POST } = await import("../route");
    const res = await POST(buildRequest(CAMPOS_VALIDOS));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it("envía una copia al equipo de soporte y un acuse de recibo al remitente", async () => {
    const { POST } = await import("../route");
    await POST(buildRequest(CAMPOS_VALIDOS));

    const [supportMail, ackMail] = mockSend.mock.calls.map(([arg]) => arg);
    expect(supportMail.to).toBe("suportvetnova@gmail.com");
    expect(supportMail.replyTo).toBe(CAMPOS_VALIDOS.email);
    expect(ackMail.to).toBe(CAMPOS_VALIDOS.email);
  });

  it("responde 400 si faltan campos obligatorios", async () => {
    const { POST } = await import("../route");
    const res = await POST(buildRequest({ ...CAMPOS_VALIDOS, mensaje: "" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Todos los campos son requeridos.");
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("responde 429 cuando se excede el límite de solicitudes", async () => {
    mockRateLimit.mockResolvedValue(false);
    const { POST } = await import("../route");
    const res = await POST(buildRequest(CAMPOS_VALIDOS));
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json.error).toBe("Demasiadas solicitudes. Intenta en un minuto.");
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("responde 500 si falta la API key de Resend", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("RESEND_API_KEY", "");
    const { POST } = await import("../route");
    const res = await POST(buildRequest(CAMPOS_VALIDOS));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe("Configuración de email incompleta.");
  });

  it("responde 502 si Resend falla al enviar", async () => {
    mockSend.mockRejectedValue(new Error("Resend error"));
    const { POST } = await import("../route");
    const res = await POST(buildRequest(CAMPOS_VALIDOS));
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.error).toBe("Error al enviar el mensaje.");
  });

  it("responde 502 si Resend devuelve un error en el payload", async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: "domain not verified" } });
    const { POST } = await import("../route");
    const res = await POST(buildRequest(CAMPOS_VALIDOS));
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.error).toBe("Error al enviar el mensaje.");
  });

  it("escapa HTML en los campos del usuario para evitar inyección en el correo", async () => {
    const { POST } = await import("../route");
    await POST(
      buildRequest({
        ...CAMPOS_VALIDOS,
        nombre: "<script>alert(1)</script>",
        mensaje: "Línea 1\n<img src=x onerror=alert(2)>",
      }),
    );

    const [supportMail] = mockSend.mock.calls.map(([arg]) => arg);
    expect(supportMail.html).not.toContain("<script>");
    expect(supportMail.html).toContain("&lt;script&gt;");
    expect(supportMail.html).not.toContain("<img src=x");
    expect(supportMail.html).toContain("&lt;img src=x onerror=alert(2)&gt;");
    expect(supportMail.html).toContain("Línea 1<br/>");
  });
});
