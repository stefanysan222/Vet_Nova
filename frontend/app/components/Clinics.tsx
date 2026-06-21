"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone } from "lucide-react";
import { fetchClinicasActivas, type ClinicaActiva } from "@/lib/api/clinicas";

export default function Clinics() {
  const [clinicas, setClinicas] = useState<ClinicaActiva[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClinicasActivas()
      .then(setClinicas)
      .finally(() => setLoading(false));
  }, []);

  if (loading || clinicas.length === 0) return null;

  const clinica = clinicas[active];
  const mapQuery =
    clinica.latitud != null && clinica.longitud != null
      ? `${clinica.latitud},${clinica.longitud}`
      : (clinica.direccion ?? clinica.nombre);

  return (
    <section id="sedes" className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4 }}
        className="mb-8 max-w-xl"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-600 dark:text-brand-300">
          Nuestras sedes
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-4xl">
          Encuentra la clínica más cercana
        </h2>
        <p className="mt-4 text-base leading-7 text-surface-500 dark:text-surface-400">
          Selecciona una sede para ver su dirección y ubicación en el mapa.
        </p>
      </motion.div>

      {clinicas.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {clinicas.map((c, i) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setActive(i)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                i === active
                  ? "border-brand-600 bg-brand-600 text-white shadow-brand-sm"
                  : "border-surface-200 bg-white text-surface-700 hover:border-brand-200 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${i === active ? "bg-white" : "bg-surface-300 dark:bg-surface-600"}`}
              />
              {c.nombre}
            </button>
          ))}
        </div>
      )}

      <div className="grid overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card dark:border-surface-800 dark:bg-surface-900 lg:grid-cols-[1fr_1.1fr]">
        <div className="p-7">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white">{clinica.nombre}</h3>

          {clinica.direccion && (
            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                <MapPin className="h-4 w-4" />
              </div>
              <p className="text-sm leading-6 text-surface-600 dark:text-surface-300">
                {clinica.direccion}
              </p>
            </div>
          )}

          <div className="mt-4 flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              <Phone className="h-4 w-4" />
            </div>
            <p className="text-sm leading-6 text-surface-600 dark:text-surface-300">
              Contacta a la clínica desde tu cuenta VetNova para conocer su teléfono y horario.
            </p>
          </div>
        </div>

        <div className="min-h-[260px] bg-surface-100 dark:bg-surface-800">
          <iframe
            key={clinica.slug}
            title={`Mapa de ${clinica.nombre}`}
            src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
            className="h-full min-h-[260px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
