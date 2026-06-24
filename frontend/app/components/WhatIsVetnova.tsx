"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const PUNTOS = [
  "Una cuenta para todas tus mascotas",
  "Conectada directamente con tu clínica",
  "Disponible desde cualquier dispositivo",
] as const;

export default function WhatIsVetnova() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-3xl border border-surface-200 dark:border-surface-800"
        >
          <Image
            src="/logos/patas-ligth.png"
            alt="Patas de distintas mascotas"
            width={560}
            height={572}
            className="block w-full dark:hidden"
          />
          <Image
            src="/logos/patas-dark.png"
            alt="Patas de distintas mascotas"
            width={560}
            height={572}
            className="hidden w-full dark:block"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-600 dark:text-brand-300">
            ¿Qué es VetNova?
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-3xl">
            La app que conecta a tu mascota con su clínica veterinaria
          </h2>
          <p className="mt-4 text-base leading-7 text-surface-500 dark:text-surface-400">
            VetNova es la plataforma que tu clínica usa para gestionar tus citas, el historial
            médico y las vacunas de tu mascota. Como dueño, tienes tu propia cuenta para ver todo
            eso desde el celular o el computador, sin llamadas ni filas.
          </p>
          <p className="mt-4 text-base leading-7 text-surface-500 dark:text-surface-400">
            Sin importar la especie de tu compañero —perro, gato u otra mascota— su información
            queda organizada y disponible para ti y para el equipo veterinario que lo atiende.
          </p>

          <ul className="mt-6 flex flex-col gap-3">
            {PUNTOS.map((punto) => (
              <li
                key={punto}
                className="flex items-center gap-3 text-sm font-semibold text-surface-700 dark:text-surface-300"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400">
                  <Check className="h-3 w-3" />
                </span>
                {punto}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
