"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchCitas, updateCitaEstado, updateCita } from "../../../lib/api/citas";
import { fetchVeterinarios } from "../../../lib/api/usuarios";
import type { UsuarioAPI } from "../../../lib/api/usuarios";
import type { Appointment } from "../../../lib/recepcionista/types";
import { getClinicSlots, isClinicOpen, getScheduleLabel } from "../../../lib/utils/clinic-schedule";
import { SkeletonCardList } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { StatusBadge } from "../../../lib/utils/status-badge";
import AppointmentDetailModal from "../../components/appointments/AppointmentDetailModal";
import InteractiveCalendar, {
  type CalendarAppointmentEvent,
} from "../../components/calendar/InteractiveCalendar";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, CheckCircle2, Clock, List, User, X } from "lucide-react";
import type { SlotInfo } from "react-big-calendar";

type AppointmentStatus = Appointment["status"];

function RescheduleModal({
  appointment,
  allAppointments,
  onClose,
  onSave,
  saving,
  mode = "reprogramar",
}: {
  appointment: Appointment;
  allAppointments: Appointment[];
  onClose: () => void;
  onSave: (date: string, time: string, veterinarian: string, veterinarianId?: number) => void;
  saving: boolean;
  mode?: "editar" | "reprogramar";
}) {
  const [date, setDate] = useState(appointment.date);
  const [time, setTime] = useState(appointment.time || "09:00");
  const [selectedVet, setSelectedVet] = useState(appointment.veterinarian ?? "");
  const [selectedVetId, setSelectedVetId] = useState<number | undefined>(
    appointment.veterinarianId,
  );
  const [vets, setVets] = useState<UsuarioAPI[]>([]);
  const [loadingVets, setLoadingVets] = useState(true);
  const [vetsError, setVetsError] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    fetchVeterinarios()
      .then((data) => {
        setVets(data);
        setVetsError(false);
      })
      .catch(() => {
        setVets([]);
        setVetsError(true);
      })
      .finally(() => setLoadingVets(false));
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-900/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 10 }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-surface-200/60 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrollable body */}
        <div className="overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-300">
                {mode === "editar" ? "Editar cita" : "Reprogramar cita"}
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
                  setSelectedVetId(undefined);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {date && (
                <p
                  className={`mt-1 text-xs font-medium ${isClinicOpen(date) ? "text-success-600 dark:text-success-400" : "text-danger-600 dark:text-danger-400"}`}
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
                <div className="dark:bg-danger-950/30 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-xs text-danger-700 dark:border-danger-900 dark:text-danger-400">
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
                        setSelectedVetId(undefined);
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

              {loadingVets ? (
                <p className="text-xs text-slate-400">Cargando veterinarios...</p>
              ) : vetsError ? (
                <p className="text-xs text-danger-500">
                  No se pudo cargar la lista de veterinarios. Intenta cerrar y abrir de nuevo.
                </p>
              ) : vets.length === 0 ? (
                <p className="text-xs text-slate-400">No hay veterinarios registrados.</p>
              ) : (
                <div className="space-y-2">
                  {availableVets.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVet(v.nombre ?? "");
                        setSelectedVetId(v.id);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition ${
                        selectedVet === v.nombre
                          ? "border-brand-400 bg-brand-50 text-brand-800 dark:border-brand-600 dark:bg-brand-950/40 dark:text-brand-200"
                          : "border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-success-100 text-xs font-bold text-success-700 dark:bg-success-900/40 dark:text-success-300">
                        {(v.nombre ?? "?")[0].toUpperCase()}
                      </span>
                      <span className="flex-1 font-medium">{v.nombre}</span>
                      <span className="text-xs text-success-600 dark:text-success-400">
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
                      <span className="text-xs text-danger-500">Ocupado</span>
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
              onClick={() => onSave(date, time, selectedVet, selectedVetId)}
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
  const [editTarget, setEditTarget] = useState<Appointment | null>(null);
  const [savingReschedule, setSavingReschedule] = useState(false);
  const [vistaActiva, setVistaActiva] = useState<"lista" | "calendario">("lista");
  const [citaDetalleCalendario, setCitaDetalleCalendario] = useState<Appointment | null>(null);
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

  const handleReschedule = async (
    date: string,
    time: string,
    veterinarian: string,
    veterinarianId?: number,
  ) => {
    const cita = rescheduleTarget ?? editTarget;
    const isEdit = !!editTarget;
    if (!cita) return;
    setSavingReschedule(true);
    try {
      const updated = await updateCita({
        ...cita,
        date,
        time,
        status: isEdit ? cita.status : "Pendiente",
        veterinarian: veterinarian || cita.veterinarian,
        veterinarianId: veterinarianId ?? cita.veterinarianId,
      });
      setAppointments((prev) => prev.map((a) => (a.id === cita.id ? updated : a)));
      setRescheduleTarget(null);
      setEditTarget(null);
      success(
        isEdit ? "Cita actualizada" : "Cita reprogramada",
        isEdit
          ? `La cita de ${cita.petName} fue actualizada.`
          : `La cita de ${cita.petName} fue reprogramada para el ${date} a las ${time}.`,
      );
    } catch (err) {
      error(
        isEdit ? "Error al actualizar" : "Error al reprogramar",
        err instanceof Error ? err.message : "No se pudo actualizar la cita.",
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

  const calendarEvents = useMemo<CalendarAppointmentEvent[]>(() => {
    return citasFiltradas
      .filter((a) => a.date)
      .map((a) => {
        const [hh, mm] = (a.time || "00:00").split(":").map((n) => parseInt(n, 10) || 0);
        const start = new Date(`${a.date}T00:00:00`);
        start.setHours(hh, mm, 0, 0);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + 30);
        return {
          title: `${a.time ?? ""} ${a.petName}`.trim(),
          start,
          end,
          resource: a,
        };
      });
  }, [citasFiltradas]);

  // TODO(MP-01): el flujo de creación de cita en este rol vive en RescheduleModal /
  // EditTarget, que requiere una cita existente. No hay un modal de "alta" reutilizable
  // en admin/citas — crear uno de cero estaría fuera de alcance de esta tarea. Se deja
  // el callback preparado para cuando exista un flujo de creación reutilizable.
  const handleSelectSlot = (_slotInfo: SlotInfo) => {
    error(
      "Crear cita desde el calendario",
      "Esta función aún no está disponible. Usa 'Agendar cita' desde el panel de veterinario o el flujo de creación existente.",
    );
  };

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
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <article className="admin-card px-5 py-4">
              <div className="mb-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                <CalendarDays className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </div>
              <p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
                {loading ? "—" : appointments.length}
              </p>
              <p className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                Total citas
              </p>
            </article>
            <article className="admin-card px-5 py-4">
              <div className="mb-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-3xl font-bold leading-none tracking-tight text-amber-600 dark:text-amber-400">
                {loading ? "—" : pendientes}
              </p>
              <p className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                Pendientes
              </p>
            </article>
            <article className="admin-card px-5 py-4">
              <div className="mb-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-3xl font-bold leading-none tracking-tight text-emerald-600 dark:text-emerald-400">
                {loading ? "—" : confirmadas}
              </p>
              <p className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                Confirmadas
              </p>
            </article>
          </div>

          {/* Filtros + Toggle de vista */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
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

            <div className="flex gap-1 rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setVistaActiva("lista")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  vistaActiva === "lista"
                    ? "bg-brand-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                Lista
              </button>
              <button
                type="button"
                onClick={() => setVistaActiva("calendario")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  vistaActiva === "calendario"
                    ? "bg-brand-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Calendario
              </button>
            </div>
          </div>

          {/* Vista calendario */}
          {vistaActiva === "calendario" && !loading && (
            <div className="mt-6">
              <InteractiveCalendar
                events={calendarEvents}
                onSelectEvent={(event) => setCitaDetalleCalendario(event.resource)}
                onSelectSlot={handleSelectSlot}
                selectable
              />
            </div>
          )}

          {/* Lista */}
          <div className={`mt-6 space-y-4 ${vistaActiva === "calendario" ? "hidden" : ""}`}>
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
                          className="rounded-xl bg-success-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-success-700 disabled:opacity-50"
                        >
                          {updatingId === appointment.id ? "..." : "Confirmar"}
                        </button>
                      )}

                      {(appointment.status === "Pendiente" ||
                        appointment.status === "Confirmada") && (
                        <button
                          onClick={() => setEditTarget(appointment)}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          Editar
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
                          className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-2 text-sm font-semibold text-danger-700 transition hover:bg-danger-100 disabled:opacity-50"
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
            mode="reprogramar"
          />
        )}
        {editTarget && (
          <RescheduleModal
            appointment={editTarget}
            allAppointments={appointments}
            onClose={() => setEditTarget(null)}
            onSave={handleReschedule}
            saving={savingReschedule}
            mode="editar"
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

      <AppointmentDetailModal
        isOpen={!!citaDetalleCalendario}
        onClose={() => setCitaDetalleCalendario(null)}
        appointment={citaDetalleCalendario}
        onCancel={(appointment) => {
          setCitaDetalleCalendario(null);
          setConfirmCancel(appointment);
        }}
      />
    </>
  );
}
