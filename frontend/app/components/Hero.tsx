"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck, ClipboardList, Heart, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: CalendarCheck,
    label: "Citas sin complicaciones",
    desc: "Agenda, confirma y recuerda citas desde cualquier dispositivo.",
  },
  {
    icon: ClipboardList,
    label: "Historia clínica digital",
    desc: "Accede al expediente completo de cada paciente en segundos.",
  },
  {
    icon: Heart,
    label: "Seguimiento de pacientes",
    desc: "Evoluciones, tratamientos y alertas de seguimiento integrados.",
  },
  {
    icon: ShieldCheck,
    label: "Roles y accesos seguros",
    desc: "Administrador, veterinario y cliente con vistas personalizadas.",
  },
] as const;

const CITAS_HOY = [
  {
    hora: "09:00",
    nombre: "Luna",
    servicio: "Vacunación",
    estado: "Confirmada",
    color: "bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300",
  },
  {
    hora: "10:30",
    nombre: "Toby",
    servicio: "Consulta general",
    estado: "En atención",
    color: "bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300",
  },
  {
    hora: "11:00",
    nombre: "Mochi",
    servicio: "Control post-op",
    estado: "Pendiente",
    color: "bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300",
  },
  {
    hora: "14:00",
    nombre: "Rocky",
    servicio: "Desparasitación",
    estado: "Confirmada",
    color: "bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300",
  },
] as const;

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Fondo suave */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-surface-50 to-surface-50 dark:from-surface-900 dark:via-surface-950 dark:to-surface-950" />
      <div className="pointer-events-none absolute -right-40 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-brand-100/40 blur-3xl dark:bg-brand-500/10" />
      <div className="pointer-events-none absolute -left-32 top-32 -z-10 h-80 w-80 rounded-full bg-success-100/50 blur-3xl dark:bg-success-500/10" />

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:px-8 lg:px-12">
        {/* Titular */}
        <div className="grid gap-16 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="max-w-2xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700 dark:border-brand-800/60 dark:bg-brand-900/30 dark:text-brand-300"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Sistema de gestión veterinaria
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-[2.75rem] font-bold leading-[1.15] tracking-tight text-surface-900 dark:text-white sm:text-5xl"
            >
              Tu clínica, organizada.
              <br />
              <span className="text-brand-600 dark:text-brand-300">Tus pacientes, cuidados.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-lg leading-relaxed text-surface-500 dark:text-surface-400"
            >
              VetNova centraliza la agenda, la historia clínica y la gestión de tu clínica
              veterinaria en un solo sistema, pensado para que puedas concentrarte en lo que
              importa: el bienestar de cada mascota.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-brand-sm dark:shadow-brand-sm"
              >
                Entrar al sistema
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center rounded-xl border border-surface-200 bg-white px-6 py-3 text-sm font-semibold text-surface-700 shadow-card transition hover:-translate-y-0.5 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-200 dark:hover:bg-surface-800"
              >
                Crear cuenta gratuita
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-5 text-xs text-surface-400 dark:text-surface-500"
            >
              Sin tarjeta de crédito · Acceso inmediato · Soporte incluido
            </motion.p>
          </div>

          {/* Panel de muestra — tarjetas de estado real */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden w-[340px] shrink-0 lg:block"
          >
            <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card dark:border-surface-800 dark:bg-surface-900">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-surface-400 dark:text-surface-500">
                  Hoy en la clínica
                </p>
                <span className="flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-[11px] font-semibold text-success-700 dark:bg-success-900/30 dark:text-success-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
                  En línea
                </span>
              </div>

              <div className="space-y-3">
                {CITAS_HOY.map((cita) => (
                  <div
                    key={cita.nombre}
                    className="flex items-center justify-between rounded-xl bg-surface-50 px-4 py-3 dark:bg-surface-800/60"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 text-xs font-semibold text-surface-400 dark:text-surface-500">
                        {cita.hora}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-surface-900 dark:text-white">
                          {cita.nombre}
                        </p>
                        <p className="text-xs text-surface-400 dark:text-surface-500">
                          {cita.servicio}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${cita.color}`}
                    >
                      {cita.estado}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-3 border-t border-surface-100 pt-4 dark:border-surface-800">
                <div className="flex-1 rounded-xl bg-surface-50 px-3 py-2.5 text-center dark:bg-surface-800/60">
                  <p className="text-xl font-bold text-surface-900 dark:text-white">4</p>
                  <p className="mt-0.5 text-[11px] text-surface-400 dark:text-surface-500">
                    Citas hoy
                  </p>
                </div>
                <div className="flex-1 rounded-xl bg-surface-50 px-3 py-2.5 text-center dark:bg-surface-800/60">
                  <p className="text-xl font-bold text-brand-600 dark:text-brand-300">2</p>
                  <p className="mt-0.5 text-[11px] text-surface-400 dark:text-surface-500">
                    Confirmadas
                  </p>
                </div>
                <div className="flex-1 rounded-xl bg-surface-50 px-3 py-2.5 text-center dark:bg-surface-800/60">
                  <p className="text-xl font-bold text-amber-500">1</p>
                  <p className="mt-0.5 text-[11px] text-surface-400 dark:text-surface-500">
                    Pendientes
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Grid de features */}
        <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group rounded-2xl border border-surface-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover dark:border-surface-800 dark:bg-surface-900 dark:hover:border-brand-700"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-300 dark:group-hover:bg-brand-900/50">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-surface-900 dark:text-white">{label}</p>
              <p className="mt-2 text-sm leading-6 text-surface-500 dark:text-surface-400">
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
