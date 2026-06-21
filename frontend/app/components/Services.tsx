"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck, PawPrint, Syringe, ClipboardList } from "lucide-react";

const SERVICES = [
  {
    icon: CalendarCheck,
    title: "Agenda citas en 2 clics",
    description:
      "Solicita la cita de tu mascota desde tu cuenta y consulta su estado: pendiente, confirmada o cancelada.",
    cta: "Agendar ahora",
    accent: "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300",
    border: "hover:border-brand-200 dark:hover:border-brand-700",
  },
  {
    icon: PawPrint,
    title: "El perfil de tu mascota",
    description:
      "Especie, raza, edad, peso y estado de salud de cada una de tus mascotas, siempre a la mano.",
    cta: "Ver mis mascotas",
    accent: "bg-success-50 text-success-600 dark:bg-success-900/30 dark:text-success-400",
    border: "hover:border-success-200 dark:hover:border-success-700",
  },
  {
    icon: Syringe,
    title: "Vacunas siempre al día",
    description:
      "Calendario de vacunación con las próximas dosis pendientes y todo el historial ya aplicado.",
    cta: "Ver calendario",
    accent: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    border: "hover:border-amber-200 dark:hover:border-amber-700",
  },
  {
    icon: ClipboardList,
    title: "Historial médico completo",
    description:
      "Cada consulta, diagnóstico y tratamiento de tu mascota, ordenado por fecha y fácil de buscar.",
    cta: "Ver historial",
    accent: "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-300",
    border: "hover:border-surface-300 dark:hover:border-surface-600",
  },
] as const;

export default function Services() {
  return (
    <section id="servicios" className="mx-auto max-w-6xl px-5 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4 }}
        className="mb-12 max-w-xl"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-600 dark:text-brand-300">
          Para dueños de mascotas
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-4xl">
          Todo lo que necesitas para cuidar a tu mascota
        </h2>
        <p className="mt-4 text-base leading-7 text-surface-500 dark:text-surface-400">
          Desde el celular, sin llamadas ni filas: así es tener a tu mascota organizada en un solo
          lugar.
        </p>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map(({ icon: Icon, title, description, cta, accent, border }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Link
              href="/login"
              className={`group block h-full rounded-2xl border border-surface-200 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-surface-800 dark:bg-surface-900 ${border}`}
            >
              <div
                className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl transition group-hover:scale-110 ${accent}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-surface-900 dark:text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-surface-500 dark:text-surface-400">
                {description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-300">
                {cta}
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
