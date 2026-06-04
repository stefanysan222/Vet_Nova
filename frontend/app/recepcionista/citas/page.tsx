"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  PawPrint,
  Search,
  Stethoscope,
  UserRound,
  XCircle,
} from "lucide-react";
import { getAppointments, setAppointmentStatus } from "../../../lib/recepcionista/storage";
import type { Appointment } from "../../../lib/recepcionista/types";
import NuevaCitaModal from "./NuevaCitaModal";

const cardHover =
  "transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(37,99,235,0.12)]";

const softCardHover =
  "transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md";

const iconHover =
  "transition-all duration-300 group-hover:scale-110 group-hover:rotate-3";

const buttonHover =
  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]";

const appointmentStatuses = [
  "Pendiente",
  "Confirmada",
  "En espera",
  "En atención",
  "Finalizada",
  "Cancelada",
  "No asistió",
] as const;

function getStatusClass(status: Appointment["status"]) {
  switch (status) {
    case "Pendiente":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "Confirmada":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    case "En espera":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    case "En atención":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    case "Finalizada":
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    case "Cancelada":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    case "No asistió":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

export default function RecepcionistaCitasPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todas");
  const [modalOpen, setModalOpen] = useState(false);

  async function loadAppointments() {
    setLoading(true);
    try {
      const data = await getAppointments();
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleStatus = async (id: string, status: Appointment["status"]) => {
    try {
      setActionError(null);
      await setAppointmentStatus(id, status);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a)),
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al actualizar. Verifica que el servidor esté activo.");
    }
  };

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    return appointments.filter((appointment) => {
      const matchesStatus =
        statusFilter === "Todas" || appointment.status === statusFilter;
      const matchesSearch =
        appointment.petName.toLowerCase().includes(normalizedSearch) ||
        appointment.ownerName.toLowerCase().includes(normalizedSearch) ||
        appointment.service.toLowerCase().includes(normalizedSearch) ||
        appointment.date.toLowerCase().includes(normalizedSearch) ||
        appointment.time.toLowerCase().includes(normalizedSearch) ||
        (appointment.veterinarian ?? "").toLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [appointments, searchTerm, statusFilter]);

  const pendingCount = useMemo(
    () => appointments.filter((item) => item.status === "Pendiente").length,
    [appointments],
  );
  const confirmedCount = useMemo(
    () => appointments.filter((item) => item.status === "Confirmada").length,
    [appointments],
  );
  const waitingCount = useMemo(
    () => appointments.filter((item) => item.status === "En espera").length,
    [appointments],
  );
  const cancelledCount = useMemo(
    () => appointments.filter((item) => item.status === "Cancelada").length,
    [appointments],
  );

  return (
    <div className="space-y-6">
      {actionError && (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          {actionError}
        </div>
      )}
      <section className={`group relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${cardHover}`}>
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-100 blur-3xl transition-transform duration-700 group-hover:scale-125 dark:bg-blue-900/20" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-cyan-100 blur-3xl dark:bg-cyan-900/20" />
        <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Citas</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">Agenda de recepción</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Revisa los turnos programados, confirma citas, registra llegadas y actualiza el estado de atención.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className={`inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 ${buttonHover}`}
          >
            <CalendarDays className="h-4 w-4" />
            Crear nueva cita
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className={`group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${cardHover}`}>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pendientes</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600 transition-colors duration-300 group-hover:bg-yellow-500 group-hover:text-white">
              <Clock className={`h-5 w-5 ${iconHover}`} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{loading ? "—" : pendingCount}</p>
        </article>

        <article className={`group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${cardHover}`}>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 to-lime-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Confirmadas</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-green-600 transition-colors duration-300 group-hover:bg-green-600 group-hover:text-white">
              <CheckCircle2 className={`h-5 w-5 ${iconHover}`} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{loading ? "—" : confirmedCount}</p>
        </article>

        <article className={`group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${cardHover}`}>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">En espera</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
              <UserRound className={`h-5 w-5 ${iconHover}`} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{loading ? "—" : waitingCount}</p>
        </article>

        <article className={`group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${cardHover}`}>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-red-600 to-pink-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Canceladas</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600 transition-colors duration-300 group-hover:bg-red-600 group-hover:text-white">
              <XCircle className={`h-5 w-5 ${iconHover}`} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{loading ? "—" : cancelledCount}</p>
        </article>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex h-12 w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition-all duration-300 focus-within:border-blue-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(37,99,235,0.08)] dark:border-slate-700 dark:bg-slate-900 lg:max-w-md">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por cliente, mascota, fecha, servicio o veterinario..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 focus:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="Todas">Todas las citas</option>
            {appointmentStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className={`group rounded-[26px] border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${softCardHover}`}
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {appointment.service || "Sin servicio"}
                      </p>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-slate-500 dark:text-slate-400 sm:grid-cols-2">
                      <span className="inline-flex items-center gap-2">
                        <PawPrint className="h-4 w-4 text-blue-600" />
                        {appointment.petName || "—"}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-blue-600" />
                        {appointment.ownerName || "—"}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-blue-600" />
                        {appointment.date} · {appointment.time}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-blue-600" />
                        {appointment.veterinarian ?? "Veterinario no asignado"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <button type="button" onClick={() => handleStatus(appointment.id, "Confirmada")} className={`rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 ${buttonHover}`}>Confirmar</button>
                    <button type="button" onClick={() => handleStatus(appointment.id, "En espera")} className={`rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 ${buttonHover}`}>Check-in</button>
                    <button type="button" onClick={() => handleStatus(appointment.id, "En atención")} className={`rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 ${buttonHover}`}>En atención</button>
                    <button type="button" onClick={() => handleStatus(appointment.id, "Finalizada")} className={`rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 ${buttonHover}`}>Finalizar</button>
                    <button type="button" onClick={() => handleStatus(appointment.id, "No asistió")} className={`rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 ${buttonHover}`}>No asistió</button>
                    <button type="button" onClick={() => handleStatus(appointment.id, "Cancelada")} className={`rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 ${buttonHover}`}>Cancelar</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-950">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">No se encontraron citas</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {appointments.length === 0
                  ? "No hay citas registradas en el sistema."
                  : "Intenta cambiar el filtro o buscar por otro dato."}
              </p>
            </div>
          )}
        </div>
      </section>

      <NuevaCitaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(nueva) => setAppointments((prev) => [nueva, ...prev])}
      />
    </div>
  );
}
