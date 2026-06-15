"use client";

import { motion } from "framer-motion";
import { CalendarCheck, ClipboardList, Users, BarChart3 } from "lucide-react";

const SERVICES = [
  {
    icon: CalendarCheck,
    title: "Agenda inteligente",
    description:
      "Los clientes solicitan citas desde su cuenta. El administrador las confirma. Sin llamadas, sin confusiones.",
    accent: "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300",
    border: "hover:border-brand-200 dark:hover:border-brand-700",
  },
  {
    icon: ClipboardList,
    title: "Historia clínica",
    description:
      "Registra consultas, diagnósticos, vacunas y tratamientos. Todo queda guardado y accesible para el veterinario.",
    accent: "bg-success-50 text-success-600 dark:bg-success-900/30 dark:text-success-400",
    border: "hover:border-success-200 dark:hover:border-success-700",
  },
  {
    icon: Users,
    title: "Gestión de pacientes",
    description:
      "Cada mascota tiene su perfil completo: especie, raza, edad, peso, alergias y su propietario vinculado.",
    accent: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    border: "hover:border-amber-200 dark:hover:border-amber-700",
  },
  {
    icon: BarChart3,
    title: "Reportes y control",
    description:
      "Estadísticas de citas, usuarios activos y actividad del sistema, disponibles para el administrador en tiempo real.",
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
          Módulos del sistema
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-4xl">
          Todo lo que necesita una clínica veterinaria moderna.
        </h2>
        <p className="mt-4 text-base leading-7 text-surface-500 dark:text-surface-400">
          Cada módulo está diseñado para un rol específico: el administrador gestiona, el
          veterinario atiende y el cliente hace seguimiento.
        </p>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map(({ icon: Icon, title, description, accent, border }, i) => (
          <motion.article
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className={`group rounded-2xl border border-surface-200 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-surface-800 dark:bg-surface-900 ${border}`}
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
          </motion.article>
        ))}
      </div>
    </section>
  );
}
