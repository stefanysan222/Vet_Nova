import { vi, describe, it, expect, beforeEach } from "vitest";

const mockRateLimit = vi.fn();
const mockSendMail = vi.fn();
const mockCreateTransport = vi.fn((..._args: unknown[]) => ({ sendMail: mockSendMail }));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
}));

vi.mock("nodemailer", () => ({
  createTransport: (...args: unknown[]) => mockCreateTransport(...args),
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
  vi.stubEnv("GMAIL_USER", "suportvetnova@gmail.com");
  vi.stubEnv("GMAIL_APP_PASSWORD", "app-password");
  mockRateLimit.mockResolvedValue(true);
  mockSendMail.mockResolvedValue({});
});

describe("POST /api/email/contact", () => {
  it("envía el mensaje vía Nodemailer/Gmail (no EmailJS) y responde ok", async () => {
    const { POST } = await import("../route");
    const res = await POST(buildRequest(CAMPOS_VALIDOS));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(mockCreateTransport).toHaveBeenCalledWith({
      service: "gmail",
      auth: { user: "suportvetnova@gmail.com", pass: "app-password" },
    });
    expect(mockSendMail).toHaveBeenCalledTimes(2);
  });

  it("envía una copia al equipo de soporte y un acuse de recibo al remitente", async () => {
    const { POST } = await import("../route");
    await POST(buildRequest(CAMPOS_VALIDOS));

    const [supportMail, ackMail] = mockSendMail.mock.calls.map(([arg]) => arg);
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
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("responde 429 cuando se excede el límite de solicitudes", async () => {
    mockRateLimit.mockResolvedValue(false);
    const { POST } = await import("../route");
    const res = await POST(buildRequest(CAMPOS_VALIDOS));
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json.error).toBe("Demasiadas solicitudes. Intenta en un minuto.");
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("responde 500 si faltan las credenciales de Gmail", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("GMAIL_USER", "");
    vi.stubEnv("GMAIL_APP_PASSWORD", "");
    const { POST } = await import("../route");
    const res = await POST(buildRequest(CAMPOS_VALIDOS));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe("Configuración de email incompleta.");
  });

  it("responde 502 si Nodemailer falla al enviar", async () => {
    mockSendMail.mockRejectedValue(new Error("SMTP error"));
    const { POST } = await import("../route");
    const res = await POST(buildRequest(CAMPOS_VALIDOS));
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.error).toBe("Error al enviar el mensaje.");
  });
});
