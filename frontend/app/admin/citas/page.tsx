"use client";

import { useEffect, useState } from "react";
import { fetchCitas, updateCitaEstado, updateCita } from "../../../lib/api/citas";
import { fetchVeterinarios } from "../../../lib/api/usuarios";
import type { UsuarioAPI } from "../../../lib/api/usuarios";
import type { Appointment } from "../../../lib/recepcionista/types";
import { getClinicSlots, isClinicOpen, getScheduleLabel } from "../../../lib/utils/clinic-schedule";
import { SkeletonCardList } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { StatusBadge } from "../../../lib/utils/status-badge";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Clock, User, X } from "lucide-react";

type AppointmentStatus = Appointment["status"];

function RescheduleModal({
  appointment,
  allAppointments,
  onClose,
  onSave,
  saving,
}: {
  appointment: Appointment;
  allAppointments: Appointment[];
  onClose: () => void;
  onSave: (date: string, time: string, veterinarian: string) => void;
  saving: boolean;
}) {
  const [date, setDate] = useState(appointment.date);
  const [time, setTime] = useState(appointment.time || "09:00");
  const [selectedVet, setSelectedVet] = useState(appointment.veterinarian ?? "");
  const [vets, setVets] = useState<UsuarioAPI[]>([]);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    fetchVeterinarios()
      .then(setVets)
      .catch(() => setVets([]));
  }, []);

  const slots = getClinicSlots(date);
  const clinicaCerrada = !!date && !isClinicOpen(date);

  // Vets ocupados en la fecha+hora seleccionada (excluyendo la cita actual)
  const busyVetNames = new Set(
    allAppointments
      .filter(
        (a) =>
          a.id !== appointment.id && a.date === date && a.time === time && a.status !== "Cancelada",
      )
      .map((a) => a.veterinarian)
      .filter(Boolean),
  );

  const availableVets = vets.filter((v) => !busyVetNames.has(v.nombre ?? ""));
  const busyVets = vets.filter((v) => busyVetNames.has(v.nombre ?? ""));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 10 }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-modal dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrollable body */}
        <div className="overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                Reprogramar cita
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                {appointment.petName}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                {appointment.service || "Sin servicio"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Fecha anterior */}
          <div className="mb-5 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">Fecha y hora anterior</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {appointment.date} · {appointment.time || "—"}
            </p>
          </div>

          <div className="space-y-5">
            {/* Fecha */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                <CalendarDays className="h-4 w-4 text-brand-600" />
                Nueva fecha
              </label>
              <input
                type="date"
                min={today}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setTime("");
                  setSelectedVet("");
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {date && (
                <p
                  className={`mt-1 text-xs font-medium ${isClinicOpen(date) ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                >
                  {isClinicOpen(date)
                    ? `Horario: ${getScheduleLabel(date)}`
                    : "La clínica está cerrada este día"}
                </p>
              )}
            </div>

            {/* Hora */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                <Clock className="h-4 w-4 text-brand-600" />
                Nueva hora
              </label>
              {clinicaCerrada ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-400">
                  No hay turnos disponibles. La clínica está cerrada ese día.
                </div>
              ) : !date ? (
                <p className="text-xs text-slate-400">Selecciona una fecha primero.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        setTime(slot);
                        setSelectedVet("");
                      }}
                      className={`rounded-xl py-2 text-xs font-medium transition ${
                        time === slot
                          ? "bg-brand-600 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Veterinarios */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                <User className="h-4 w-4 text-brand-600" />
                Veterinario
                {date && time && (
                  <span className="ml-auto text-xs font-normal text-slate-400">
                    {availableVets.length} disponible{availableVets.length !== 1 ? "s" : ""}
                  </span>
                )}
              </label>

              {vets.length === 0 ? (
                <p className="text-xs text-slate-400">Cargando veterinarios...</p>
              ) : (
                <div className="space-y-2">
                  {availableVets.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVet(v.nombre ?? "")}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition ${
                        selectedVet === v.nombre
                          ? "border-brand-400 bg-brand-50 text-brand-800 dark:border-brand-600 dark:bg-brand-950/40 dark:text-brand-200"
                          : "border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        {(v.nombre ?? "?")[0].toUpperCase()}
                      </span>
                      <span className="flex-1 font-medium">{v.nombre}</span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">
                        Disponible
                      </span>
                    </button>
                  ))}

                  {busyVets.map((v) => (
                    <div
                      key={v.id}
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm opacity-50 dark:border-slate-800 dark:bg-slate-800/50"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-xs font-bold text-slate-500 dark:bg-slate-700">
                        {(v.nombre ?? "?")[0].toUpperCase()}
                      </span>
                      <span className="flex-1 font-medium text-slate-500 dark:text-slate-400">
                        {v.nombre}
                      </span>
                      <span className="text-xs text-rose-500">Ocupado</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer fijo */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(date, time, selectedVet)}
              disabled={saving || !date || !time || clinicaCerrada}
              className="flex-1 rounded-2xl bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CitasPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<"todas" | "pendientes" | "confirmadas">("todas");
  const [confirmCancel, setConfirmCancel] = useState<Appointment | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [savingReschedule, setSavingReschedule] = useState(false);
  const { success, error } = useToast();

  const cargar = () => {
    setLoading(true);
    fetchCitas()
      .then(setAppointments)
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Carga inicial de datos al montar — setLoading(true) antes del fetch es el patrón estándar
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, []);

  const cambiarEstado = async (id: string, status: AppointmentStatus, silent = false) => {
    setUpdatingId(id);
    try {
      await updateCitaEstado(id, status);
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      if (!silent)
        success(
          status === "Confirmada" ? "Cita confirmada" : "Cita actualizada",
          status === "Confirmada"
            ? "La cita fue confirmada exitosamente."
            : `Estado cambiado a ${status}.`,
        );
    } catch (err) {
      error(
        "Error al actualizar",
        err instanceof Error ? err.message : "No se pudo actualizar la cita.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelConfirm = async () => {
    if (!confirmCancel) return;
    const cita = confirmCancel;
    setConfirmCancel(null);
    await cambiarEstado(cita.id, "Cancelada", true);
    success("Cita cancelada", `La cita de ${cita.petName} fue cancelada.`);
  };

  const handleReschedule = async (date: string, time: string, veterinarian: string) => {
    if (!rescheduleTarget) return;
    const cita = rescheduleTarget;
    setSavingReschedule(true);
    try {
      const updated = await updateCita({
        ...cita,
        date,
        time,
        status: "Pendiente",
        veterinarian: veterinarian || cita.veterinarian,
      });
      setAppointments((prev) => prev.map((a) => (a.id === cita.id ? updated : a)));
      setRescheduleTarget(null);
      success(
        "Cita reprogramada",
        `La cita de ${cita.petName} fue reprogramada para el ${date} a las ${time}.`,
      );
    } catch (err) {
      error(
        "Error al reprogramar",
        err instanceof Error ? err.message : "No se pudo reprogramar la cita.",
      );
    } finally {
      setSavingReschedule(false);
    }
  };

  const citasFiltradas = appointments.filter((a) => {
    if (filtro === "pendientes") return a.status === "Pendiente";
    if (filtro === "confirmadas") return a.status === "Confirmada";
    return true;
  });

  const pendientes = appointments.filter((a) => a.status === "Pendiente").length;
  const confirmadas = appointments.filter((a) => a.status === "Confirmada").length;

  return (
    <>
      <div className="admin-page">
        <section className="admin-card-padded">
          <div>
            <p className="text-eyebrow">Citas</p>
            <h1 className="text-page-title mt-2">Agenda de atención</h1>
            <p className="text-subtitle mt-1 max-w-2xl">
              Gestiona las citas del sistema. Confirma, reprograma o cancela las solicitudes
              pendientes.
            </p>
          </div>

          {/* Estadísticas */}
          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            <article className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-xs dark:border-slate-700 dark:bg-slate-800/50">
              <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-slate-400" />
              <p className="text-label pl-1">Total citas</p>
              <p className="text-stat mt-1 pl-1 text-slate-900 dark:text-white">
                {loading ? "—" : appointments.length}
              </p>
            </article>
            <article className="relative overflow-hidden rounded-2xl border border-amber-200/70 bg-amber-50 p-5 shadow-xs dark:border-amber-900 dark:bg-amber-950/30">
              <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-amber-500" />
              <p className="text-label pl-1 text-amber-600 dark:text-amber-400">Pendientes</p>
              <p className="text-stat mt-1 pl-1 text-amber-800 dark:text-amber-300">
                {loading ? "—" : pendientes}
              </p>
            </article>
            <article className="relative overflow-hidden rounded-2xl border border-emerald-200/70 bg-emerald-50 p-5 shadow-xs dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-emerald-500" />
              <p className="text-label pl-1 text-emerald-600 dark:text-emerald-400">Confirmadas</p>
              <p className="text-stat mt-1 pl-1 text-emerald-800 dark:text-emerald-300">
                {loading ? "—" : confirmadas}
              </p>
            </article>
          </div>

          {/* Filtros */}
          <div className="mt-6 flex flex-wrap gap-2">
            {(["todas", "pendientes", "confirmadas"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  filtro === f
                    ? "bg-brand-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Lista */}
          <div className="mt-6 space-y-4">
            {loading ? (
              <SkeletonCardList count={5} />
            ) : citasFiltradas.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                <p className="text-slate-600 dark:text-slate-400">
                  No hay citas que coincidan con el filtro.
                </p>
              </div>
            ) : (
              citasFiltradas.map((appointment) => (
                <article
                  key={appointment.id}
                  className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-xs transition-shadow duration-200 hover:shadow-card-hover dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {appointment.date} · {appointment.time}
                      </p>
                      <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                        {appointment.petName}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {appointment.service || "—"} ·{" "}
                        {appointment.veterinarian || "Sin veterinario asignado"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Propietario: {appointment.ownerName || "—"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={appointment.status} />

                      {appointment.status === "Pendiente" && (
                        <button
                          onClick={() => cambiarEstado(appointment.id, "Confirmada")}
                          disabled={updatingId === appointment.id}
                          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {updatingId === appointment.id ? "..." : "Confirmar"}
                        </button>
                      )}

                      {appointment.status === "Cancelada" && (
                        <button
                          onClick={() => setRescheduleTarget(appointment)}
                          className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950/30 dark:text-brand-300 dark:hover:bg-brand-900/40"
                        >
                          Reprogramar
                        </button>
                      )}

                      {(appointment.status === "Pendiente" ||
                        appointment.status === "Confirmada") && (
                        <button
                          onClick={() => setConfirmCancel(appointment)}
                          disabled={updatingId === appointment.id}
                          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {rescheduleTarget && (
          <RescheduleModal
            appointment={rescheduleTarget}
            allAppointments={appointments}
            onClose={() => setRescheduleTarget(null)}
            onSave={handleReschedule}
            saving={savingReschedule}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmCancel}
        title={`¿Cancelar la cita de ${confirmCancel?.petName}?`}
        description="La cita pasará al estado Cancelada. Esta acción no se puede deshacer."
        confirmLabel="Sí, cancelar cita"
        cancelLabel="No, mantener"
        onConfirm={handleCancelConfirm}
        onCancel={() => setConfirmCancel(null)}
      />
    </>
  );
}
