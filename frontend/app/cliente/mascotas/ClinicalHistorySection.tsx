"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Syringe, Stethoscope } from "lucide-react";
import {
  fetchClinicalHistory,
  downloadClinicalHistoryPdf,
  type TimelineEventAPI,
} from "../../../lib/api/historias-clinicas";
import { SkeletonCardList } from "../../components/ui/Skeleton";
import StatusBadge from "../../components/ui/StatusBadge";

interface ClinicalHistorySectionProps {
  petId: number;
  petName: string;
}

export default function ClinicalHistorySection({ petId, petName }: ClinicalHistorySectionProps) {
  const [eventos, setEventos] = useState<TimelineEventAPI[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    let activo = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    setError("");

    fetchClinicalHistory(petId)
      .then((data) => {
        if (activo) setEventos(data.eventos);
      })
      .catch(() => {
        if (activo) setError("No se pudo cargar el historial clínico.");
      })
      .finally(() => {
        if (activo) setLoading(false);
      });

    return () => {
      activo = false;
    };
  }, [petId]);

  const handleDescargar = async () => {
    setDescargando(true);
    try {
      await downloadClinicalHistoryPdf(petId, `historial-clinico-${petName || petId}.pdf`);
    } catch {
      setError("No se pudo descargar el PDF del historial clínico.");
    } finally {
      setDescargando(false);
    }
  };

  return (
    <section className="rounded-xl border border-surface-200 bg-white p-7 shadow-sm dark:border-surface-700 dark:bg-surface-900">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FileText className="h-[22px] w-[22px] shrink-0 text-brand-600" />
          <div>
            <h2 className="text-section-title">Historial clínico</h2>
            <p className="text-subtitle mt-1">Consultas y vacunas registradas.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDescargar}
          disabled={descargando || loading || !eventos?.length}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {descargando ? "Generando..." : "Descargar PDF"}
        </button>
      </div>

      {loading ? (
        <SkeletonCardList count={3} />
      ) : error ? (
        <div className="rounded-xl border border-dashed border-danger-200 bg-danger-50 px-6 py-8 text-center dark:border-danger-700/40 dark:bg-danger-900/10">
          <p className="text-sm font-semibold text-danger-700 dark:text-danger-400">{error}</p>
        </div>
      ) : !eventos || eventos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-200 bg-surface-50 px-6 py-10 text-center dark:border-surface-700 dark:bg-surface-950">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
            <FileText className="h-[22px] w-[22px]" />
          </div>
          <p className="mt-4 text-sm font-semibold text-surface-900 dark:text-white">
            Sin historial clínico registrado
          </p>
          <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
            Esta mascota aún no tiene consultas ni vacunas registradas.
          </p>
        </div>
      ) : (
        <ol className="relative space-y-6 border-l border-surface-200 pl-6 dark:border-surface-700 sm:pl-7">
          {eventos.map((evento, i) => (
            <TimelineItem key={`${evento.tipo}-${evento.fecha}-${i}`} evento={evento} />
          ))}
        </ol>
      )}
    </section>
  );
}

function TimelineItem({ evento }: { evento: TimelineEventAPI }) {
  const esVacuna = evento.tipo === "vacuna";
  const Icon = esVacuna ? Syringe : Stethoscope;

  return (
    <li className="relative">
      <span
        className={`absolute -left-[31px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full sm:-left-[37px] ${
          esVacuna
            ? "bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-400"
            : "bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>

      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-surface-900 dark:text-white">{evento.titulo}</p>
        <StatusBadge status={esVacuna ? "Vacuna" : "Consulta"} />
      </div>

      <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
        {formatearFecha(evento.fecha)}
      </p>

      {evento.descripcion && (
        <p className="mt-2 text-sm text-surface-600 dark:text-surface-300">{evento.descripcion}</p>
      )}

      {evento.registradoPor && (
        <p className="mt-1 text-xs text-surface-400 dark:text-surface-500">
          Registrado por: {evento.registradoPor}
        </p>
      )}
    </li>
  );
}

function formatearFecha(fecha: string | null) {
  if (!fecha) return "Sin fecha";
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
