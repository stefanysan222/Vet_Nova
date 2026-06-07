import { NextResponse } from "next/server";
import * as nodemailer from "nodemailer";
import { rateLimit } from "@/lib/rate-limit";

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

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return NextResponse.json({ error: "Configuración de email incompleta." }, { status: 500 });
  }

  const body = await req.json();
  const { nombre, email, asunto, mensaje } = body;

  if (!nombre?.trim() || !email?.trim() || !asunto?.trim() || !mensaje?.trim()) {
    return NextResponse.json({ error: "Todos los campos son requeridos." }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: `"VetNova" <${user}>`,
      to: user,
      replyTo: email.trim(),
      subject: `[Contacto] ${asunto.trim()}`,
      html: `
        <p><strong>Nombre:</strong> ${nombre.trim()}</p>
        <p><strong>Correo:</strong> ${email.trim()}</p>
        <p><strong>Asunto:</strong> ${asunto.trim()}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje.trim().replace(/\n/g, "<br/>")}</p>
      `,
    });

    await transporter.sendMail({
      from: `"VetNova" <${user}>`,
      to: email.trim(),
      subject: "Hemos recibido tu mensaje — VetNova",
      html: `
        <p>Hola <strong>${nombre.trim()}</strong>,</p>
        <p>Gracias por escribirnos. Hemos recibido tu mensaje sobre "<strong>${asunto.trim()}</strong>" y te responderemos dentro de las 24 horas hábiles siguientes.</p>
        <p>El equipo de VetNova</p>
      `,
    });
  } catch (err) {
    console.error("Nodemailer error:", err);
    return NextResponse.json({ error: "Error al enviar el mensaje." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
