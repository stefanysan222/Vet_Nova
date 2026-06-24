"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, PawPrint, Stethoscope, X } from "lucide-react";
import { StatusBadge } from "../../../lib/utils/status-badge";
import type { Appointment } from "../../../lib/recepcionista/types";

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  /** Acción opcional de cancelar — solo se muestra si se provee y la cita no está ya cerrada. */
  onCancel?: (appointment: Appointment) => void;
  cancelLoading?: boolean;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function AppointmentDetailModal({
  isOpen,
  onClose,
  appointment,
  onCancel,
  cancelLoading = false,
}: AppointmentDetailModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!appointment) return null;

  const canCancel =
    !!onCancel && appointment.status !== "Cancelada" && appointment.status !== "Finalizada";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-surface-900/50 px-4 py-8 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-detalle-cita"
            onClick={(event) => event.stopPropagation()}
            className="max-h-full w-full max-w-lg overflow-y-auto rounded-3xl border border-surface-200/60 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900"
          >
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <h2
                    id="titulo-detalle-cita"
                    className="text-lg font-semibold text-slate-900 dark:text-white"
                  >
                    Detalle de la cita
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    Información completa de la atención programada
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar detalle"
                className="flex h-9 min-w-[44px] items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="flex flex-col justify-between gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Mascota
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                    {appointment.petName}
                  </h3>
                  {appointment.petEspecie && (
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                      {appointment.petEspecie}
                      {appointment.petRaza ? ` · ${appointment.petRaza}` : ""}
                    </p>
                  )}
                </div>
                <StatusBadge status={appointment.status} />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoRow
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Fecha"
                  value={appointment.date}
                />
                <InfoRow
                  icon={<Clock className="h-4 w-4" />}
                  label="Hora"
                  value={appointment.time}
                />
                <InfoRow
                  icon={<Stethoscope className="h-4 w-4" />}
                  label="Servicio"
                  value={appointment.service || "Consulta"}
                />
                <InfoRow
                  icon={<PawPrint className="h-4 w-4" />}
                  label="Veterinario"
                  value={appointment.veterinarian || "Por asignar"}
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Notas
                </p>
                <p className="mt-1.5 text-sm leading-6 text-slate-900 dark:text-white">
                  {appointment.notes || "Sin notas registradas."}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 dark:border-slate-700 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cerrar
              </button>
              {canCancel && (
                <button
                  type="button"
                  disabled={cancelLoading}
                  onClick={() => onCancel?.(appointment)}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-danger-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-danger-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cancelLoading ? "Cancelando..." : "Cancelar cita"}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
