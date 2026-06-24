"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMascotas } from "../../../../lib/api/mascotas";
import { useAuth } from "@/lib/auth-context";
import type { PetRecord } from "../../../../lib/recepcionista/types";
import { ArrowLeft, Info, Lock } from "lucide-react";
import ClinicalHistorySection from "../ClinicalHistorySection";

export default function PerfilCompletoMascotaPage() {
  const params = useParams();
  const id = String(params?.Id ?? "");

  const [mascota, setMascota] = useState<PetRecord | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;

    const uid = user?.id ?? undefined;

    fetchMascotas(uid)
      .then((lista) => {
        const encontrada = lista.find((m) => String(m.id) === id) ?? null;
        setMascota(encontrada);
        if (!encontrada) setError("Mascota no encontrada.");
      })
      .catch(() => setError("No se pudo cargar la información de la mascota."))
      .finally(() => setCargando(false));
  }, [id, user]);

  if (cargando) {
    return (
      <div className="flex min-h-[420px] items-center justify-center bg-surface-50 dark:bg-surface-950">
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Cargando información de la mascota...
        </p>
      </div>
    );
  }

  if (!mascota) {
    return (
      <div className="h-full overflow-y-auto bg-surface-50 px-6 py-8 dark:bg-surface-950">
        <Link
          href="/cliente/mascotas"
          className="inline-flex items-center gap-2 text-sm font-medium text-surface-500 transition-colors hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
          Volver a mascotas
        </Link>

        <div className="mt-8 flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-surface-200 bg-white p-8 text-center dark:border-surface-700 dark:bg-surface-900">
          <h1 className="text-xl font-semibold text-surface-900 dark:text-white">
            Mascota no encontrada
          </h1>
          <p className="mt-3 text-sm text-surface-500 dark:text-surface-400">
            {error || "No fue posible cargar la información solicitada."}
          </p>
        </div>
      </div>
    );
  }

  const tipoNormalizado = mascota.especie.toLowerCase().includes("perro")
    ? "perro"
    : mascota.especie.toLowerCase().includes("gato")
      ? "gato"
      : "otro";

  return (
    <div className="h-full overflow-y-auto bg-surface-50 px-6 py-8 dark:bg-surface-950">
      <div className="mb-7">
        <Link
          href="/cliente/mascotas"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-surface-500 transition-colors hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
          Volver a mascotas
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-page-title">Perfil completo de {mascota.nombre}</h1>
            <p className="text-subtitle mt-3">
              Consulta la información registrada y su historial clínico.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[335px_1fr]">
        <aside className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm dark:border-surface-700 dark:bg-surface-900">
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
              {mascota.foto ? (
                <Image
                  src={mascota.foto}
                  alt={`Foto de ${mascota.nombre}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : tipoNormalizado === "perro" ? (
                <DogIcon />
              ) : tipoNormalizado === "gato" ? (
                <CatIcon />
              ) : (
                <PetIcon />
              )}
            </div>

            <h2 className="mt-5 text-xl font-semibold text-surface-900 dark:text-white">
              {mascota.nombre}
            </h2>

            <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
              {mascota.especie} · {mascota.raza}
            </p>

            <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">{mascota.edad}</p>
          </div>

          {mascota.propietarioNombre && (
            <div className="mt-7 border-t border-surface-200 pt-5 dark:border-surface-700">
              <p className="text-label">Propietario</p>
              <p className="mt-1 text-sm font-semibold text-surface-900 dark:text-white">
                {mascota.propietarioNombre}
              </p>
            </div>
          )}
        </aside>

        <main className="space-y-6">
          <section className="rounded-xl border border-surface-200 bg-white p-7 shadow-sm dark:border-surface-700 dark:bg-surface-900">
            <div className="mb-6 flex items-center gap-3">
              <Info className="h-[22px] w-[22px] shrink-0 text-brand-600" />
              <h2 className="text-section-title">Información de la mascota</h2>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              <Dato label="Nombre" value={mascota.nombre} />
              <Dato label="Especie" value={mascota.especie || "No registrada"} />
              <Dato label="Raza" value={mascota.raza || "No registrada"} />
              <Dato label="Sexo" value={formatearTexto(mascota.sexo)} />
              <Dato label="Fecha de nacimiento" value={formatearFecha(mascota.fechaNacimiento)} />
              <Dato label="Edad" value={mascota.edad || "No registrada"} />
              <Dato label="Peso aproximado" value={formatearPeso(mascota.peso)} />
            </div>
          </section>

          <ClinicalHistorySection petId={parseInt(mascota.id, 10)} petName={mascota.nombre} />

          <div className="flex items-start gap-3 rounded-xl border border-surface-200 bg-surface-50 px-5 py-4 dark:border-surface-700 dark:bg-surface-900">
            <Lock className="mt-0.5 h-[19px] w-[19px] shrink-0 text-brand-600" />
            <p className="text-xs leading-6 text-surface-500 dark:text-surface-400">
              Esta vista es únicamente de consulta. Desde aquí no se pueden editar los datos de la
              mascota ni modificar su historial clínico.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

function Dato({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-label">{label}</p>
      <p className="mt-2 text-sm font-semibold text-surface-900 dark:text-white">{value}</p>
    </div>
  );
}

function formatearTexto(texto?: string) {
  if (!texto || texto === "No especificado") return "No registrado";
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatearFecha(fecha?: string) {
  if (!fecha) return "No registrada";
  const d = new Date(`${fecha}T00:00:00`);
  if (isNaN(d.getTime())) return fecha;
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function formatearPeso(peso?: string) {
  if (!peso?.trim()) return "No registrado";
  return peso.toLowerCase().includes("kg") ? peso : `${peso} kg`;
}

function DogIcon() {
  return (
    <svg width="70" height="70" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 9 4 7v7c0 4 3.2 6 8 6s8-2 8-6V7l-3 2M9 14h.01M15 14h.01M10 17c1 .7 3 .7 4 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CatIcon() {
  return (
    <svg width="70" height="70" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 9 7 4l4 3h2l4-3 2 5v6c0 3-3 5-7 5s-7-2-7-5V9ZM9 13h.01M15 13h.01M10 16c1.1.6 2.9.6 4 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PetIcon() {
  return (
    <svg width="58" height="58" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 12.5c-2 0-3.5 1.5-3.5 3.4 0 2.2 1.8 3.6 4 3.6h7c2.2 0 4-1.4 4-3.6 0-1.9-1.5-3.4-3.5-3.4"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M9 8.5C9 10.4 8 12 6.7 12S4.5 10.4 4.5 8.5 5.5 5 6.7 5 9 6.6 9 8.5Zm10.5 0c0 1.9-1 3.5-2.2 3.5S15 10.4 15 8.5 16 5 17.3 5s2.2 1.6 2.2 3.5ZM14.5 8c0 2-1.1 3.6-2.5 3.6S9.5 10 9.5 8 10.6 4.4 12 4.4 14.5 6 14.5 8Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}
