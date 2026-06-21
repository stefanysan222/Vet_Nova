"use client";

import { motion } from "framer-motion";

export default function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4 }}
        className="relative flex min-h-[280px] items-center overflow-hidden rounded-3xl border border-surface-200 bg-white p-12 dark:border-surface-800 dark:bg-surface-900 sm:p-14"
      >
        {/* Logo difuminado como marca de agua, sin recortes, adaptado a claro/oscuro */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-30px] top-1/2 hidden h-[300px] w-[300px] -translate-y-1/2 bg-contain bg-center bg-no-repeat opacity-50 blur-[7px] dark:hidden sm:block"
          style={{ backgroundImage: "url(/logos/Vetnova-ligth-word.jpg)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-30px] top-1/2 hidden h-[300px] w-[300px] -translate-y-1/2 bg-contain bg-center bg-no-repeat opacity-55 mix-blend-lighten blur-[7px] dark:block sm:block"
          style={{ backgroundImage: "url(/logos/Vetnova-dark-word.jpg)" }}
        />

        <div className="relative max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-600 dark:text-brand-300">
            ¿Por qué VetNova?
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-3xl">
            La salud de tu mascota, sin fricción
          </h2>
          <p className="mt-4 text-base leading-7 text-surface-500 dark:text-surface-400">
            Creamos VetNova porque agendar una cita, encontrar un carné de vacunas o recordar la
            última visita al veterinario no debería tomar más tiempo que la consulta misma.
            Centralizamos todo en un solo lugar para que tú te enfoques en lo que importa: el
            bienestar de tu mascota, no en el papeleo.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
