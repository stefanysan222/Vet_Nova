"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { Mail, MapPin, Phone, CheckCircle, AlertCircle } from "lucide-react";

const ASUNTOS = [
  "Problema con mi cuenta",
  "Error en el sistema",
  "Consulta general",
  "Solicitud de soporte",
  "Otro",
];

const EMAILJS_URL = "https://api.emailjs.com/api/v1.0/email/send";

const inputClass =
  "w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm text-surface-900 outline-none transition placeholder:text-surface-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

type Estado = "idle" | "enviando" | "ok" | "error";

type Campos = {
  nombre: string;
  email: string;
  asunto: string;
  asuntoOtro: string;
  mensaje: string;
};

const VACIO: Campos = { nombre: "", email: "", asunto: "", asuntoOtro: "", mensaje: "" };

export default function ReportSection() {
  const [campos, setCampos] = useState<Campos>(VACIO);
  const [estado, setEstado] = useState<Estado>("idle");

  const actualizar = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCampos((prev) => ({ ...prev, [name]: value }));
  };

  const asuntoFinal = campos.asunto === "Otro" ? campos.asuntoOtro.trim() : campos.asunto;

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!campos.nombre.trim() || !campos.email.trim() || !asuntoFinal || !campos.mensaje.trim()) {
      return;
    }

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateAdmin = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ADMIN;
    const templateClient = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_CLIENT;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateAdmin || !templateClient || !publicKey) {
      setEstado("error");
      return;
    }

    setEstado("enviando");

    const params = {
      from_name: campos.nombre.trim(),
      from_email: campos.email.trim(),
      subject: asuntoFinal,
      message: campos.mensaje.trim(),
    };

    const enviarEmail = (templateId: string) =>
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

    try {
      const [resAdmin, resClient] = await Promise.all([
        enviarEmail(templateAdmin),
        enviarEmail(templateClient),
      ]);

      if (resAdmin.ok && resClient.ok) {
        setEstado("ok");
        setCampos(VACIO);
      } else {
        const err1 = resAdmin.ok ? "" : await resAdmin.text();
        const err2 = resClient.ok ? "" : await resClient.text();
        console.error("EmailJS error admin:", err1);
        console.error("EmailJS error client:", err2);
        setEstado("error");
      }
    } catch (err) {
      console.error("EmailJS fetch error:", err);
      setEstado("error");
    }
  };

  return (
    <section
      id="contacto"
      className="mx-auto mt-4 max-w-6xl rounded-2xl border border-surface-200 bg-white px-8 py-10 shadow-card sm:px-10"
    >
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        {/* Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-600">
              Contacto
            </p>
            <h2 className="mt-3 text-2xl font-bold text-surface-900 sm:text-3xl">
              ¿Tienes alguna pregunta sobre el sistema?
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-surface-500">
              Si necesitas ayuda con tu cuenta, tienes una consulta técnica o quieres reportar un
              problema, escríbenos y te respondemos a la brevedad.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-surface-600">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Mail className="h-4 w-4" />
              </div>
              soporte@vetnova.co
            </div>
            <div className="flex items-center gap-3 text-sm text-surface-600">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Phone className="h-4 w-4" />
              </div>
              +57 300 123 4567
            </div>
            <div className="flex items-center gap-3 text-sm text-surface-600">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <MapPin className="h-4 w-4" />
              </div>
              Bogotá, Colombia
            </div>
          </div>

          <div className="rounded-xl border border-vet-100 bg-vet-50 px-5 py-4">
            <p className="text-sm font-semibold text-vet-700">Tiempo de respuesta</p>
            <p className="mt-1 text-sm text-vet-600">
              Respondemos dentro de las 24 horas hábiles siguientes.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={enviar} className="space-y-4 rounded-2xl border border-surface-100 bg-surface-50 p-6">

          {estado === "ok" && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <p className="text-sm font-medium text-emerald-700">
                Mensaje enviado correctamente. El equipo de administración lo recibirá en breve.
              </p>
            </div>
          )}

          {estado === "error" && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <p className="text-sm font-medium text-red-700">
                No se pudo enviar el mensaje. Intenta nuevamente o escríbenos directamente a soporte@vetnova.co
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">Nombre completo</label>
            <input
              required
              type="text"
              name="nombre"
              value={campos.nombre}
              onChange={actualizar}
              placeholder="Tu nombre"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">Correo electrónico</label>
            <input
              required
              type="email"
              name="email"
              value={campos.email}
              onChange={actualizar}
              placeholder="correo@ejemplo.com"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">Asunto</label>
            <select
              required
              name="asunto"
              value={campos.asunto}
              onChange={actualizar}
              className={inputClass}
            >
              <option value="">Selecciona un asunto</option>
              {ASUNTOS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {campos.asunto === "Otro" && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700">Especifica el asunto</label>
              <input
                required
                type="text"
                name="asuntoOtro"
                value={campos.asuntoOtro}
                onChange={actualizar}
                placeholder="Escribe tu asunto..."
                className={inputClass}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">Mensaje</label>
            <textarea
              required
              name="mensaje"
              value={campos.mensaje}
              onChange={actualizar}
              rows={4}
              placeholder="Describe tu consulta o problema..."
              className={`${inputClass} resize-none py-3`}
            />
          </div>

          <button
            type="submit"
            disabled={estado === "enviando"}
            className="w-full rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {estado === "enviando" ? "Enviando..." : "Enviar mensaje"}
          </button>
        </form>
      </div>
    </section>
  );
}
