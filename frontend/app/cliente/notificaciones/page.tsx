"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
  type NotificacionAPI,
} from "../../../lib/api/notificaciones";
import { Check, Bell, BellRing, CalendarDays, UserRound, Settings } from "lucide-react";

type IconKey = "calendar" | "account" | "system";

const TIPO_INFO: Record<string, { category: string; icon: IconKey; color: string }> = {
  cita_actualizada: {
    category: "Citas",
    icon: "calendar",
    color: "bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300",
  },
  nueva_cita: {
    category: "Citas",
    icon: "calendar",
    color: "bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300",
  },
  bienvenida: {
    category: "Cuenta",
    icon: "account",
    color: "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400",
  },
  perfil_actualizado: {
    category: "Cuenta",
    icon: "account",
    color: "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400",
  },
};

const DEFAULT_TIPO_INFO = {
  category: "General",
  icon: "system" as IconKey,
  color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

function tipoInfo(tipo?: string) {
  return (tipo && TIPO_INFO[tipo]) || DEFAULT_TIPO_INFO;
}

function formatFecha(dateStr: string): string {
  const fecha = new Date(dateStr);
  if (Number.isNaN(fecha.getTime())) return dateStr;
  return fecha.toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificacionesPage() {
  const [notifications, setNotifications] = useState<NotificacionAPI[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotificaciones()
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter((n) => !n.leida).length;
  const filteredNotifications = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.leida);
    if (filter === "read") return notifications.filter((n) => n.leida);
    return notifications;
  }, [filter, notifications]);

  const selected = notifications.find((n) => n.id === selectedId) ?? null;

  const handleViewAll = () => {
    setFilter("all");
    setSelectedId(null);
  };

  const handleMarcarLeida = async (id: number) => {
    await marcarLeida(id).catch(() => {});
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
  };

  const handleMarcarTodas = async () => {
    await marcarTodasLeidas().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  return (
    <div className="admin-page h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-page-title">Notificaciones</h1>
          <p className="text-subtitle mt-2">Centro de alertas y recordatorios</p>
        </div>

        <button
          type="button"
          onClick={unreadCount > 0 ? handleMarcarTodas : handleViewAll}
          className="btn-primary whitespace-nowrap"
        >
          <Check className="h-[18px] w-[18px]" />
          {unreadCount > 0 ? "Marcar todas como leídas" : "Ver todas"}
        </button>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <SummaryCard
          title="Total"
          value={notifications.length.toString()}
          icon={<Bell className="h-[22px] w-[22px]" />}
        />

        <SummaryCard
          title="No leídas"
          value={unreadCount.toString()}
          icon={<BellRing className="h-[22px] w-[22px]" />}
        />

        <SummaryCard
          title="Citas"
          value={notifications
            .filter((n) => tipoInfo(n.tipo).category === "Citas")
            .length.toString()}
          icon={<CalendarDays className="h-[22px] w-[22px]" />}
        />

        <SummaryCard
          title="Cuenta"
          value={notifications
            .filter((n) => tipoInfo(n.tipo).category === "Cuenta")
            .length.toString()}
          icon={<UserRound className="h-[22px] w-[22px]" />}
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.38fr]">
        {/* Notifications list */}
        <section className="admin-card-padded">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-section-title">Notificaciones recientes</h2>
              <p className="text-subtitle mt-1">
                Revisa las novedades relacionadas con tu cuenta y tus citas.
              </p>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              {(["all", "unread", "read"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                    filter === f
                      ? "bg-brand-600 text-white shadow-brand-sm"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  {f === "all" ? "Todas" : f === "unread" ? "No leídas" : "Leídas"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-section-title">No hay notificaciones con este filtro.</p>
              <p className="text-subtitle mt-2">
                Presiona &quot;Ver todas&quot; para regresar al listado completo.
              </p>
              <button type="button" onClick={handleViewAll} className="btn-primary mt-5">
                Ver todas
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredNotifications.map((item) => {
                const info = tipoInfo(item.tipo);
                return (
                  <article
                    key={item.id}
                    className="flex items-start justify-between gap-5 py-5 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${info.color}`}
                      >
                        {info.icon === "calendar" && <CalendarDays className="h-[22px] w-[22px]" />}
                        {info.icon === "account" && <UserRound className="h-[22px] w-[22px]" />}
                        {info.icon === "system" && <Settings className="h-[22px] w-[22px]" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                            {item.titulo}
                          </h3>
                          {!item.leida && <span className="h-2 w-2 rounded-full bg-accent-500" />}
                        </div>
                        <p className="mt-1 max-w-[720px] text-sm leading-6 text-slate-500 dark:text-slate-400">
                          {item.mensaje}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {info.category}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatFecha(item.creadaEn)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-900/30"
                      >
                        Ver
                      </button>
                      {!item.leida && (
                        <button
                          type="button"
                          onClick={() => handleMarcarLeida(item.id)}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                          Marcar leída
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Detalle + Preferencias */}
        <div className="space-y-5">
          {/* Detalle de notificación */}
          <aside className="admin-card-padded xl:min-h-[300px]">
            {selected ? (
              <div>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-eyebrow">Detalle</p>
                    <h2 className="text-section-title mt-1">{selected.titulo}</h2>
                  </div>
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${selected.leida ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" : "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400"}`}
                  >
                    {selected.leida ? "Leída" : "No leída"}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <p className="text-label">Categoría</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {tipoInfo(selected.tipo).category}
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-label">Descripción</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {selected.mensaje}
                    </p>
                  </div>
                  <div>
                    <p className="text-label">Fecha</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {formatFecha(selected.creadaEn)}
                    </p>
                  </div>
                </div>

                {!selected.leida && (
                  <button
                    type="button"
                    onClick={() => handleMarcarLeida(selected.id)}
                    className="btn-secondary mt-5 w-full justify-center"
                  >
                    Marcar como leída
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleViewAll}
                  className="btn-primary mt-3 w-full justify-center"
                >
                  Ver todas las notificaciones
                </button>
              </div>
            ) : (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-section-title">Selecciona una notificación</p>
                <p className="text-subtitle mt-2">
                  Haz clic en &quot;Ver&quot; para ver el detalle.
                </p>
                <button type="button" onClick={handleViewAll} className="btn-secondary mt-4">
                  Volver a todas
                </button>
              </div>
            )}
          </aside>

          {/* Resumen */}
          <section className="admin-card-padded">
            <h2 className="text-section-title">Resumen</h2>
            <div className="mt-4 space-y-3">
              <SummaryLine label="Notificaciones nuevas" value={unreadCount.toString()} />
              <SummaryLine label="Total" value={notifications.length.toString()} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="admin-card flex items-center justify-between px-5 py-4">
      <div>
        <p className="text-label">{title}</p>
        <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
        {icon}
      </div>
    </article>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 pb-3 last:border-b-0 last:pb-0 dark:border-slate-700">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}
