"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

interface Review {
  quote: string;
  name: string;
  pet: string;
  photo: string;
}

const REVIEWS: Review[] = [
  {
    quote:
      "Agendar la cita de vacunación de Toby me toma un minuto desde el celular. Antes era llamar y esperar.",
    name: "Marcela R.",
    pet: "Dueña de Toby",
    photo: "/logos/mascota.jpeg",
  },
  {
    quote:
      "Me encanta poder ver el historial completo de Kiwi: vacunas, controles, todo en un solo lugar.",
    name: "Andrés F.",
    pet: "Dueño de Kiwi",
    photo: "/logos/mascota1.jpeg",
  },
  {
    quote:
      "Las notificaciones de recordatorio de citas me han salvado más de una vez. Nieve nunca se pierde un control.",
    name: "Daniela P.",
    pet: "Dueña de Nieve",
    photo: "/logos/mascota2.jpeg",
  },
  {
    quote:
      "Mi clínica usa VetNova y como cliente noto la diferencia: todo más rápido, más claro y sin papeles.",
    name: "Juliana G.",
    pet: "Dueña de Mishi",
    photo: "/logos/mascota3.jpeg",
  },
];

const PER_SLIDE = 2;
const SLIDES = Array.from({ length: Math.ceil(REVIEWS.length / PER_SLIDE) }, (_, i) =>
  REVIEWS.slice(i * PER_SLIDE, i * PER_SLIDE + PER_SLIDE),
);

export default function Reviews() {
  const [index, setIndex] = useState(0);

  const goTo = (i: number) => setIndex((i + SLIDES.length) % SLIDES.length);

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4 }}
        className="mb-10 max-w-xl"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-accent-600 dark:text-accent-400">
          Lo que dicen nuestros clientes
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-4xl">
          Dueños felices, mascotas mejor cuidadas
        </h2>
        <p className="mt-4 text-base leading-7 text-surface-500 dark:text-surface-400">
          Reseñas reales de quienes ya gestionan la salud de sus mascotas con VetNova.
        </p>
      </motion.div>

      <div className="overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="grid gap-5 sm:grid-cols-2"
          >
            {SLIDES[index].map((review) => (
              <div
                key={review.name}
                className="flex flex-col rounded-2xl border border-surface-200 bg-white p-6 shadow-card dark:border-surface-800 dark:bg-surface-900"
              >
                <div className="mb-3 flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-6 text-surface-700 dark:text-surface-300">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-surface-100 dark:border-surface-800">
                    <Image
                      src={review.photo}
                      alt={review.pet}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-900 dark:text-white">
                      {review.name}
                    </p>
                    <p className="text-xs text-surface-400 dark:text-surface-500">{review.pet}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3.5">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label="Reseñas anteriores"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-surface-200 bg-white text-surface-600 transition hover:border-brand-300 hover:text-brand-600 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir al grupo de reseñas ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-[18px] bg-brand-600" : "w-1.5 bg-surface-200 dark:bg-surface-700"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label="Siguientes reseñas"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-surface-200 bg-white text-surface-600 transition hover:border-brand-300 hover:text-brand-600 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}
