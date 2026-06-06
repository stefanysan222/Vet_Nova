import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const EMAILJS_URL = "https://api.emailjs.com/api/v1.0/email/send";

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

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateAdmin = process.env.EMAILJS_TEMPLATE_ADMIN;
  const templateClient = process.env.EMAILJS_TEMPLATE_CLIENT;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateAdmin || !templateClient || !publicKey) {
    return NextResponse.json({ error: "Configuración de email incompleta." }, { status: 500 });
  }

  const body = await req.json();
  const { nombre, email, asunto, mensaje } = body;

  if (!nombre?.trim() || !email?.trim() || !asunto?.trim() || !mensaje?.trim()) {
    return NextResponse.json({ error: "Todos los campos son requeridos." }, { status: 400 });
  }

  const params = {
    from_name: nombre.trim(),
    from_email: email.trim(),
    subject: asunto.trim(),
    message: mensaje.trim(),
  };

  const enviar = (templateId: string) =>
    fetch(EMAILJS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: params,
      }),
    });

  const [resAdmin, resClient] = await Promise.all([enviar(templateAdmin), enviar(templateClient)]);

  if (!resAdmin.ok || !resClient.ok) {
    return NextResponse.json({ error: "Error al enviar el mensaje." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
