"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { getAppointments, updateAppointment } from "../../../lib/recepcionista/storage";
import type { Appointment } from "../../../lib/recepcionista/types";

export default function RecepcionistaCitasPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    setAppointments(getAppointments());
  }, []);

  const handleStatus = (id: string, status: Appointment["status"]) => {
    const appointment = appointments.find((item) => item.id === id);
    if (!appointment) return;
    updateAppointment({ ...appointment, status });
    setAppointments(getAppointments());
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Citas</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Agenda</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Revisa los turnos programados y administra su estado.</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{appointment.service}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{appointment.petName} · {appointment.ownerName}</p>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-200">
                  {appointment.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleStatus(appointment.id, "Confirmada")}
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => handleStatus(appointment.id, "Completada")}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Completar
                </button>
                <button
                  type="button"
                  onClick={() => handleStatus(appointment.id, "Cancelada")}
                  className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                >
                  Cancelar
                </button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-slate-500 dark:text-slate-400">
                <span>Fecha: {appointment.date}</span>
                <span>Hora: {appointment.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
