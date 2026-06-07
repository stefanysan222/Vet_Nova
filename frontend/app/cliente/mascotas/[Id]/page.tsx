"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMascotas } from "../../../../lib/api/mascotas";
import { useAuth } from "@/lib/auth-context";
import type { PetRecord } from "../../../../lib/recepcionista/types";

type DocumentoClinicoAdjunto = {
  id: string;
  nombre: string;
  tipo: string;
  tamano: number;
  fechaCarga: string;
  dataUrl?: string;
};

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
      <div className="flex min-h-[420px] items-center justify-center bg-[#F5F7FB] dark:bg-[#0F172A]">
        <p className="text-[15px] text-[#64748B] dark:text-[#94A3B8]">
          Cargando información de la mascota...
        </p>
      </div>
    );
  }

  if (!mascota) {
    return (
      <div className="h-full overflow-y-auto bg-[#F5F7FB] px-6 py-8 dark:bg-[#0F172A]">
        <Link
          href="/cliente/mascotas"
          className="inline-flex items-center gap-2 text-[14px] font-medium text-[#64748B] transition-colors hover:text-[#2F6BFF] dark:text-[#94A3B8] dark:hover:text-[#60A5FA]"
        >
          <ArrowLeftIcon />
          Volver a mascotas
        </Link>

        <div className="mt-8 flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center dark:border-[#334155] dark:bg-[#111827]">
          <h1 className="text-[21px] font-semibold text-[#10213A] dark:text-white">
            Mascota no encontrada
          </h1>
          <p className="mt-3 text-[15px] text-[#64748B] dark:text-[#94A3B8]">
            {error || "No fue posible cargar la información solicitada."}
          </p>
        </div>
      </div>
    );
  }

  const documentosClinicos: DocumentoClinicoAdjunto[] = [];
  const tipoNormalizado = mascota.especie.toLowerCase().includes("perro")
    ? "perro"
    : mascota.especie.toLowerCase().includes("gato")
      ? "gato"
      : "otro";

  return (
    <div className="h-full overflow-y-auto bg-[#F5F7FB] px-6 py-8 dark:bg-[#0F172A]">
      <div className="mb-7">
        <Link
          href="/cliente/mascotas"
          className="mb-5 inline-flex items-center gap-2 text-[14px] font-medium text-[#64748B] transition-colors hover:text-[#2F6BFF] dark:text-[#94A3B8] dark:hover:text-[#60A5FA]"
        >
          <ArrowLeftIcon />
          Volver a mascotas
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-semibold text-[#10213A] dark:text-white">
              Perfil completo de {mascota.nombre}
            </h1>
            <p className="mt-3 text-[15px] text-[#64748B] dark:text-[#94A3B8]">
              Consulta la información registrada y su historial clínico.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[335px_1fr]">
        <aside className="rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-[132px] w-[132px] items-center justify-center overflow-hidden rounded-2xl bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]">
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

            <h2 className="mt-5 text-[23px] font-semibold text-[#10213A] dark:text-white">
              {mascota.nombre}
            </h2>

            <p className="mt-2 text-[15px] text-[#64748B] dark:text-[#94A3B8]">
              {mascota.especie} · {mascota.raza}
            </p>

            <p className="mt-2 text-[15px] text-[#64748B] dark:text-[#94A3B8]">{mascota.edad}</p>
          </div>

          {mascota.propietarioNombre && (
            <div className="mt-7 border-t border-[#E2E8F0] pt-5 dark:border-[#334155]">
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">Propietario</p>
              <p className="mt-1 text-[15px] font-semibold text-[#10213A] dark:text-white">
                {mascota.propietarioNombre}
              </p>
            </div>
          )}
        </aside>

        <main className="space-y-6">
          <section className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
            <div className="mb-6 flex items-center gap-3">
              <InfoIcon />
              <h2 className="text-[19px] font-semibold text-[#10213A] dark:text-white">
                Información de la mascota
              </h2>
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

          <section className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
            <div className="mb-6 flex items-center gap-3">
              <FileIcon />
              <div>
                <h2 className="text-[19px] font-semibold text-[#10213A] dark:text-white">
                  Historial clínico
                </h2>
                <p className="mt-1 text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                  Archivos adjuntados al registrar la mascota.
                </p>
              </div>
            </div>

            {documentosClinicos.length > 0 ? (
              <div className="space-y-4">
                {documentosClinicos.map((documento) => (
                  <DocumentoClinicoCard key={documento.id} documento={documento} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFD] px-6 py-10 text-center dark:border-[#334155] dark:bg-[#0F172A]">
                <div className="mx-auto flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#E7EEFF] text-[#2F6BFF] dark:bg-[#1E3A8A] dark:text-[#93C5FD]">
                  <FileIcon />
                </div>
                <p className="mt-4 text-[15px] font-semibold text-[#10213A] dark:text-white">
                  Sin historial clínico adjunto
                </p>
                <p className="mt-2 text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                  Esta mascota no tiene archivos clínicos registrados.
                </p>
              </div>
            )}
          </section>

          <div className="flex items-start gap-3 rounded-xl border border-[#D6E1F0] bg-[#F8FAFD] px-5 py-4 dark:border-[#334155] dark:bg-[#111827]">
            <LockIcon />
            <p className="text-[13px] leading-6 text-[#64748B] dark:text-[#94A3B8]">
              Esta vista es únicamente de consulta. Desde aquí no se pueden editar los datos de la
              mascota ni modificar su historial clínico.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

function DocumentoClinicoCard({ documento }: { documento: DocumentoClinicoAdjunto }) {
  const archivoDisponible = Boolean(documento.dataUrl);
  const esPdf =
    documento.nombre.toLowerCase().endsWith(".pdf") || documento.tipo.toLowerCase().includes("pdf");

  return (
    <article className="flex flex-col justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFD] p-4 dark:border-[#334155] dark:bg-[#0F172A] sm:flex-row sm:items-center">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-xl bg-[#E7EEFF] text-[#2F6BFF] dark:bg-[#1E3A8A] dark:text-[#93C5FD]">
          <FileIcon />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-[#10213A] dark:text-white">
            {documento.nombre}
          </p>
          <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
            {esPdf ? "Documento PDF" : "Archivo clínico"} · {formatearTamano(documento.tamano)}
          </p>
          <p className="mt-1 text-[12px] text-[#64748B] dark:text-[#94A3B8]">
            Cargado el {formatearFechaDocumento(documento.fechaCarga)}
          </p>
        </div>
      </div>

      {archivoDisponible ? (
        <div className="flex shrink-0 flex-wrap gap-3">
          <a
            href={documento.dataUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-[40px] items-center gap-2 rounded-lg border border-[#CBD5E1] bg-white px-4 text-[13px] font-semibold text-[#10213A] transition-colors hover:border-[#2F6BFF] hover:text-[#2F6BFF] dark:border-[#334155] dark:bg-[#111827] dark:text-white"
          >
            <EyeIcon />
            {esPdf ? "Ver PDF" : "Ver archivo"}
          </a>
          <a
            href={documento.dataUrl}
            download={documento.nombre}
            className="inline-flex h-[40px] items-center gap-2 rounded-lg bg-[#2F6BFF] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#2457D6]"
          >
            <DownloadIcon />
            Descargar
          </a>
        </div>
      ) : (
        <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">Archivo no disponible</p>
      )}
    </article>
  );
}

function Dato({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8]">{label}</p>
      <p className="mt-2 text-[15px] font-semibold text-[#10213A] dark:text-white">{value}</p>
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

function formatearFechaDocumento(fecha: string) {
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return "fecha no disponible";
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function formatearPeso(peso?: string) {
  if (!peso?.trim()) return "No registrado";
  return peso.toLowerCase().includes("kg") ? peso : `${peso} kg`;
}

function formatearTamano(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="m15 18-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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

function InfoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#2F6BFF]">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 11v6M12 7.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#2F6BFF]">
      <path d="M7 3h7l4 4v14H7V3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path
        d="M14 3v5h4M10 13h5M10 17h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 4v10M8 10l4 4 4-4M4 19h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      className="mt-0.5 shrink-0 text-[#2F6BFF]"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
