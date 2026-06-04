"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import { fetchCitas } from "../../../lib/api/citas";
import type { Appointment } from "../../../lib/recepcionista/types";

function getStatusClass(estado: string) {
  if (estado === "Confirmada") return "bg-emerald-100 text-emerald-700";
  if (estado === "Pendiente") return "bg-amber-100 text-amber-700";
  if (estado === "Cancelada") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

export default function CitasPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCitas()
      .then(setAppointments)
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar />
        <div className="lg:order-2">
          <Navbar />
          <main className="mx-auto max-w-7xl px-6 pb-12 pt-6 lg:px-10">
            <section className="rounded-[2rem] border border-slate-200/60 bg-white/95 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-950">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">Citas</p>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Agenda de atención</h1>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
                    Vista general de todas las citas registradas en el sistema.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <article className="rounded-3xl border border-slate-200/70 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Total citas</h2>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Registros en la base de datos.</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{loading ? "—" : appointments.length}</p>
                </article>
                <article className="rounded-3xl border border-slate-200/70 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Pendientes</h2>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Citas aún sin confirmar.</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                    {loading ? "—" : appointments.filter((a) => a.status === "Pendiente").length}
                  </p>
                </article>
              </div>

              <div className="mt-8 space-y-4">
                {loading ? (
                  <p className="text-sm text-slate-500">Cargando citas...</p>
                ) : appointments.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-slate-600 dark:text-slate-400">No hay citas registradas en el sistema.</p>
                    <p className="mt-2 text-sm text-slate-500">Regístralas desde el módulo de Recepcionista.</p>
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <article key={appointment.id} className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {appointment.date} · {appointment.time}
                          </p>
                          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{appointment.petName}</h2>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {appointment.service || "—"} · {appointment.veterinarian || "Sin veterinario"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">Propietario: {appointment.ownerName || "—"}</p>
                        </div>
                        <span className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
