"use client";

import { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import { CalendarDays, FileText, CheckCircle } from "lucide-react";

type NotificationItem = {
  title: string;
  description: string;
  category: string;
  time: string;
  icon: typeof CalendarDays;
};

const notifications: NotificationItem[] = [
  {
    title: "Nueva cita agendada",
    description: "Se creó una nueva cita para el paciente Max a las 10:00 AM.",
    category: "Citas",
    time: "Hace 5 min",
    icon: CalendarDays,
  },
  {
    title: "Inventario bajo",
    description: "El inventario de alimento premium está por debajo de 10 unidades.",
    category: "Alertas",
    time: "Hace 25 min",
    icon: FileText,
  },
  {
    title: "Usuario registrado",
    description: "Se agregó un nuevo recepcionista al sistema.",
    category: "Usuarios",
    time: "Hace 1 hora",
    icon: CheckCircle,
  },
];

export default function AdminNotificationsPage() {
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 px-6 py-8">
          <section className="mb-8 rounded-3xl bg-white p-8 shadow-sm shadow-slate-200/40 dark:bg-slate-900 dark:shadow-slate-950/40">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
                  Notificaciones administrativas
                </p>
                <h1 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-white">
                  Todas las notificaciones
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
                  Revisa los avisos más recientes y mantente al día con los eventos críticos del sistema.
                </p>
              </div>
              <div className="rounded-3xl bg-slate-100 px-5 py-4 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                <p className="text-sm text-slate-500 dark:text-slate-400">Total de notificaciones</p>
                <p className="mt-2 text-3xl font-semibold">{notifications.length}</p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              {notifications.map((notification) => {
                const Icon = notification.icon;
                const isSelected = selectedNotification?.title === notification.title;
                return (
                  <article
                    key={notification.title}
                    onClick={() => setSelectedNotification(notification)}
                    className={`cursor-pointer rounded-3xl border p-6 shadow-sm transition-colors hover:border-blue-400 hover:bg-blue-50 dark:hover:border-blue-500 dark:hover:bg-slate-900 ${
                      isSelected
                        ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-slate-900"
                        : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-600 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                            {notification.title}
                          </h2>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {notification.category}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {notification.description}
                        </p>
                        <p className="mt-4 text-sm text-slate-500 dark:text-slate-500">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              {selectedNotification ? (
                <div>
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600 dark:text-blue-400">
                        Detalle de notificación
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
                        {selectedNotification.title}
                      </h2>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {selectedNotification.category}
                    </span>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-900">
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Descripción</p>
                      <p className="mt-3 text-base leading-7 text-slate-700 dark:text-slate-300">
                        {selectedNotification.description}
                      </p>
                    </div>

                    <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-900">
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Hora</p>
                      <p className="mt-3 text-base leading-7 text-slate-700 dark:text-slate-300">
                        {selectedNotification.time}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedNotification(null)}
                      className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Volver al listado
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                    Resumen
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
                    Actividad reciente
                  </h2>
                  <div className="mt-6 space-y-4">
                    <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Citas nuevas</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">1</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Alertas de inventario</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">1</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Usuarios registrados</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">1</p>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}
