import { NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rate-limit";
import { API_URL } from "@/lib/config";

export const maxDuration = 30;

const FROM_ADDRESS = "VetNova <notificaciones@vetnova.online>";

async function notificarSuperAdmin(datos: {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
}): Promise<void> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8_000);
    const res = await fetch(`${API_URL}/notificaciones/contacto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      console.error("No se pudo crear la notificación interna:", res.status);
    }
  } catch (err) {
    console.error("Error al notificar al super admin:", err);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: Request) {
  const ip =
    (req as Request & { headers: Headers }).headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown";
  if (!(await rateLimit(`contact:${ip}`, 5, 60_000))) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta en un minuto." },
      { status: 429 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const supportInbox = process.env.SUPPORT_INBOX ?? "suportvetnova@gmail.com";

  if (!apiKey) {
    return NextResponse.json({ error: "Configuración de email incompleta." }, { status: 500 });
  }

  const body = await req.json();
  const { nombre, email, asunto, mensaje } = body;

  if (!nombre?.trim() || !email?.trim() || !asunto?.trim() || !mensaje?.trim()) {
    return NextResponse.json({ error: "Todos los campos son requeridos." }, { status: 400 });
  }

  const resend = new Resend(apiKey);

  const nombreSeguro = escapeHtml(nombre.trim());
  const emailSeguro = escapeHtml(email.trim());
  const asuntoSeguro = escapeHtml(asunto.trim());
  const mensajeSeguro = escapeHtml(mensaje.trim()).replace(/\n/g, "<br/>");

  // Mejor esfuerzo: si el backend no responde, no debe tumbar el envío del email.
  const notificacionInterna = notificarSuperAdmin({
    nombre: nombre.trim(),
    email: email.trim(),
    asunto: asunto.trim(),
    mensaje: mensaje.trim(),
  });

  try {
    const [, supportResult, ackResult] = await Promise.all([
      notificacionInterna,
      resend.emails.send({
        from: FROM_ADDRESS,
        to: supportInbox,
        replyTo: email.trim(),
        subject: `[Contacto] ${asunto.trim()}`,
        html: `
          <p><strong>Nombre:</strong> ${nombreSeguro}</p>
          <p><strong>Correo:</strong> ${emailSeguro}</p>
          <p><strong>Asunto:</strong> ${asuntoSeguro}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${mensajeSeguro}</p>
        `,
      }),
      resend.emails.send({
        from: FROM_ADDRESS,
        to: email.trim(),
        subject: "Hemos recibido tu mensaje — VetNova",
        html: `
          <p>Hola <strong>${nombreSeguro}</strong>,</p>
          <p>Gracias por escribirnos. Hemos recibido tu mensaje sobre "<strong>${asuntoSeguro}</strong>" y te responderemos dentro de las 24 horas hábiles siguientes.</p>
          <p>El equipo de VetNova</p>
        `,
      }),
    ]);

    if (supportResult.error || ackResult.error) {
      console.error("Resend error:", supportResult.error ?? ackResult.error);
      return NextResponse.json({ error: "Error al enviar el mensaje." }, { status: 502 });
    }
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json({ error: "Error al enviar el mensaje." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
