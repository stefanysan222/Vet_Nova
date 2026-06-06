"use client";

import { useEffect, useState } from "react";
import { fetchCitas } from "../../../lib/api/citas";
import { CalendarDays, CheckCircle } from "lucide-react";
import type { Appointment } from "../../../lib/recepcionista/types";

type NotificacionItem = {
  id: string;
  title: string;
  description: string;
  category: "Citas" | "Sistema";
  time: string;
  icon: typeof CalendarDays;
  urgente: boolean;
};

export default function AdminNotificationsPage() {
  const [notificaciones, setNotificaciones] = useState<NotificacionItem[]>([]);
  const [selected, setSelected] = useState<NotificacionItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCitas()
      .then((citas) => {
        const items: NotificacionItem[] = [];

        // Citas pendientes de confirmar
        const pendientes = citas.filter((c: Appointment) => c.status === "Pendiente");
        if (pendientes.length > 0) {
          items.push({
            id: "citas-pendientes",
            title: `${pendientes.length} cita${pendientes.length > 1 ? "s" : ""} pendiente${pendientes.length > 1 ? "s" : ""} de confirmación`,
            description: `Las siguientes citas están esperando tu confirmación: ${pendientes
              .slice(0, 3)
              .map((c) => c.petName)
              .join(
                ", ",
              )}${pendientes.length > 3 ? " y más..." : "."} Ve a la sección de Citas para gestionarlas.`,
            category: "Citas",
            time: "Actualizado ahora",
            icon: CalendarDays,
            urgente: pendientes.length >= 3,
          });
        }

        // Citas de hoy
        const hoy = new Date().toISOString().slice(0, 10);
        const citasHoy = citas.filter(
          (c: Appointment) => c.date === hoy && c.status !== "Cancelada",
        );
        if (citasHoy.length > 0) {
          items.push({
            id: "citas-hoy",
            title: `${citasHoy.length} cita${citasHoy.length > 1 ? "s" : ""} programada${citasHoy.length > 1 ? "s" : ""} para hoy`,
            description: `Pacientes de hoy: ${citasHoy
              .slice(0, 3)
              .map((c) => `${c.petName} (${c.time})`)
              .join(", ")}${citasHoy.length > 3 ? "..." : "."}`,
            category: "Citas",
            time: "Hoy",
            icon: CheckCircle,
            urgente: false,
          });
        }

        if (items.length === 0) {
          items.push({
            id: "sistema-ok",
            title: "Todo en orden",
            description:
              "No hay alertas activas en este momento. El sistema funciona con normalidad.",
            category: "Sistema",
            time: "Ahora",
            icon: CheckCircle,
            urgente: false,
          });
        }

        setNotificaciones(items);
      })
      .catch(() => setNotificaciones([]))
      .finally(() => setLoading(false));
  }, []);

  const urgentes = notificaciones.filter((n) => n.urgente).length;

  return (
    <div className="admin-page">
      <section className="admin-card-padded mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-eyebrow">Notificaciones</p>
            <h1 className="text-page-title mt-2">Alertas del sistema</h1>
            <p className="text-subtitle mt-1 max-w-2xl">
              Alertas generadas en tiempo real a partir de los datos del sistema.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-xs dark:border-slate-700 dark:bg-slate-800">
              <p className="text-label">Total alertas</p>
              <p className="text-stat mt-1 text-slate-900 dark:text-white">
                {loading ? "—" : notificaciones.length}
              </p>
            </div>
            {urgentes > 0 && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 shadow-xs dark:border-red-800 dark:bg-red-950/60">
                <p className="text-label text-red-500 dark:text-red-400">Urgentes</p>
                <p className="text-stat mt-1 text-red-700 dark:text-red-300">{urgentes}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando notificaciones...</p>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {notificaciones.map((n) => {
              const Icon = n.icon;
              const isSelected = selected?.id === n.id;
              return (
                <article
                  key={n.id}
                  onClick={() => setSelected(n)}
                  className={`cursor-pointer rounded-2xl border p-6 shadow-sm transition-colors hover:border-brand-400 hover:bg-brand-50 dark:hover:border-brand-500 dark:hover:bg-slate-900 ${
                    isSelected
                      ? "border-brand-400 bg-brand-50 dark:border-brand-500 dark:bg-slate-900"
                      : n.urgente
                        ? "border-red-200 bg-white dark:border-red-800 dark:bg-slate-950"
                        : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${n.urgente ? "bg-red-500" : "bg-brand-600"} text-white`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                          {n.title}
                        </h2>
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${n.urgente ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"} dark:bg-slate-800 dark:text-slate-300`}
                        >
                          {n.category}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {n.description}
                      </p>
                      <p className="mt-4 text-sm text-slate-500">{n.time}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            {selected ? (
              <div>
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">
                      Detalle
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
                      {selected.title}
                    </h2>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {selected.category}
                  </span>
                </div>
                <div className="space-y-5">
                  <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-900">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Descripción
                    </p>
                    <p className="mt-3 text-base leading-7 text-slate-700 dark:text-slate-300">
                      {selected.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="w-full rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Resumen
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
                  Actividad del sistema
                </h2>
                <div className="mt-6 space-y-4">
                  {notificaciones.map((n) => (
                    <div key={n.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                      <p className="text-sm text-slate-500 dark:text-slate-400">{n.category}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                        {n.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </section>
      )}
    </div>
  );
}
