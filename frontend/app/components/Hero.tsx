import Link from "next/link";
import { ArrowRight, CalendarCheck, ClipboardList, Heart, ShieldCheck } from "lucide-react";

const FEATURES = [
  { icon: CalendarCheck, label: "Citas sin complicaciones",    desc: "Agenda, confirma y recuerda citas desde cualquier dispositivo." },
  { icon: ClipboardList, label: "Historia clínica digital",    desc: "Accede al expediente completo de cada paciente en segundos." },
  { icon: Heart,         label: "Seguimiento de pacientes",    desc: "Evoluciones, tratamientos y alertas de seguimiento integrados." },
  { icon: ShieldCheck,   label: "Roles y accesos seguros",     desc: "Administrador, veterinario y cliente con vistas personalizadas." },
] as const;

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Fondo suave */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-white to-white" />
      <div className="pointer-events-none absolute -right-40 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-brand-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-32 -z-10 h-80 w-80 rounded-full bg-vet-100/50 blur-3xl" />

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:px-8 lg:px-12">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          Sistema de gestión veterinaria
        </div>

        {/* Titular */}
        <div className="grid gap-16 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="max-w-2xl">
            <h1 className="text-[2.75rem] font-bold leading-[1.15] tracking-tight text-surface-900 sm:text-5xl">
              Tu clínica, organizada.<br />
              <span className="text-brand-600">Tus pacientes, cuidados.</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-surface-500">
              VetNova centraliza la agenda, la historia clínica y la gestión de tu clínica veterinaria en un solo sistema, pensado para que puedas concentrarte en lo que importa: el bienestar de cada mascota.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700"
              >
                Entrar al sistema
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center rounded-xl border border-surface-200 bg-white px-6 py-3 text-sm font-semibold text-surface-700 shadow-card transition hover:bg-surface-50"
              >
                Crear cuenta gratuita
              </Link>
            </div>

            <p className="mt-5 text-xs text-surface-400">
              Sin tarjeta de crédito · Acceso inmediato · Soporte incluido
            </p>
          </div>

          {/* Panel de muestra — tarjetas de estado real */}
          <div className="hidden w-[340px] shrink-0 lg:block">
            <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card-md">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-surface-400">Hoy en la clínica</p>
                <span className="flex items-center gap-1 rounded-full bg-vet-50 px-2.5 py-1 text-[11px] font-semibold text-vet-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-vet-500" />
                  En línea
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { hora: "09:00", nombre: "Luna",  servicio: "Vacunación",        estado: "Confirmada",  color: "bg-vet-50 text-vet-700" },
                  { hora: "10:30", nombre: "Toby",  servicio: "Consulta general",  estado: "En atención", color: "bg-brand-50 text-brand-700" },
                  { hora: "11:00", nombre: "Mochi", servicio: "Control post-op",   estado: "Pendiente",   color: "bg-amber-50 text-amber-700" },
                  { hora: "14:00", nombre: "Rocky", servicio: "Desparasitación",   estado: "Confirmada",  color: "bg-vet-50 text-vet-700" },
                ].map((cita) => (
                  <div key={cita.nombre} className="flex items-center justify-between rounded-xl bg-surface-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-10 text-xs font-semibold text-surface-400">{cita.hora}</span>
                      <div>
                        <p className="text-sm font-semibold text-surface-900">{cita.nombre}</p>
                        <p className="text-xs text-surface-400">{cita.servicio}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${cita.color}`}>
                      {cita.estado}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-3 border-t border-surface-100 pt-4">
                <div className="flex-1 rounded-xl bg-surface-50 px-3 py-2.5 text-center">
                  <p className="text-xl font-bold text-surface-900">4</p>
                  <p className="mt-0.5 text-[11px] text-surface-400">Citas hoy</p>
                </div>
                <div className="flex-1 rounded-xl bg-surface-50 px-3 py-2.5 text-center">
                  <p className="text-xl font-bold text-brand-600">2</p>
                  <p className="mt-0.5 text-[11px] text-surface-400">Confirmadas</p>
                </div>
                <div className="flex-1 rounded-xl bg-surface-50 px-3 py-2.5 text-center">
                  <p className="text-xl font-bold text-amber-500">1</p>
                  <p className="mt-0.5 text-[11px] text-surface-400">Pendientes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de features */}
        <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="group rounded-2xl border border-surface-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-100">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-surface-900">{label}</p>
              <p className="mt-2 text-sm leading-6 text-surface-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
