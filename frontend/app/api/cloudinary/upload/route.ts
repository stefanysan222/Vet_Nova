import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip =
    (req as Request & { headers: Headers }).headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown";
  if (!rateLimit(`upload:${ip}`, 10, 60_000)) {
    return NextResponse.json(
      { error: "Demasiadas subidas. Intenta en un minuto." },
      { status: 429 },
    );
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Faltan las variables de entorno de Cloudinary." },
      { status: 500 },
    );
  }

  const formData = await req.formData();
  const archivo = formData.get("file");

  if (!archivo || !(archivo instanceof File)) {
    return NextResponse.json({ error: "No se recibió un archivo válido." }, { status: 400 });
  }

  const uploadForm = new FormData();
  uploadForm.append("file", archivo);
  uploadForm.append("folder", "vetnova_mascotas");

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  const respuesta = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
    },
    body: uploadForm,
  });

  const json = await respuesta.json();

  if (!respuesta.ok) {
    return NextResponse.json(
      { error: json.error?.message || "Error subiendo la imagen a Cloudinary." },
      { status: respuesta.status },
    );
  }

  return NextResponse.json({ url: json.secure_url });
}
