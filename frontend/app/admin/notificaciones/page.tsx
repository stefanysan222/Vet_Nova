"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle, Check } from "lucide-react";
import {
  fetchNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
  type NotificacionAPI,
} from "../../../lib/api/notificaciones";
import { SkeletonCardList } from "../../components/ui/Skeleton";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Ahora";
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h}h`;
  return `Hace ${Math.floor(h / 24)}d`;
}

type Filtro = "todas" | "no_leidas";

export default function AdminNotificationsPage() {
  const [todas, setTodas] = useState<NotificacionAPI[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("no_leidas");
  const [selected, setSelected] = useState<NotificacionAPI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotificaciones(false)
      .then(setTodas)
      .catch(() => setTodas([]))
      .finally(() => setLoading(false));
  }, []);

  const visibles = filtro === "no_leidas" ? todas.filter((n) => !n.leida) : todas;
  const noLeidas = todas.filter((n) => !n.leida).length;

  const handleLeida = async (id: number) => {
    await marcarLeida(id).catch(() => {});
    setTodas((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    if (selected?.id === id) setSelected((s) => s && { ...s, leida: true });
  };

  const handleTodas = async () => {
    await marcarTodasLeidas().catch(() => {});
    setTodas((prev) => prev.map((n) => ({ ...n, leida: true })));
    setSelected(null);
  };

  return (
    <div className="admin-page">
      <section className="admin-card-padded mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-eyebrow">Notificaciones</p>
            <h1 className="text-page-title mt-2">Alertas del sistema</h1>
            <p className="text-subtitle mt-1 max-w-2xl">
              Notificaciones generadas cuando los clientes agendan citas.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-xs dark:border-slate-700 dark:bg-slate-800">
              <p className="text-label">Total</p>
              <p className="text-stat mt-1 text-slate-900 dark:text-white">
                {loading ? "—" : todas.length}
              </p>
            </div>
            {noLeidas > 0 && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 shadow-xs dark:border-red-800 dark:bg-red-950/60">
                <p className="text-label text-red-500 dark:text-red-400">No leídas</p>
                <p className="text-stat mt-1 text-red-700 dark:text-red-300">{noLeidas}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tabs + acción */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
          {(["no_leidas", "todas"] as Filtro[]).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                filtro === f
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {f === "no_leidas" ? `No leídas${noLeidas > 0 ? ` (${noLeidas})` : ""}` : "Todas"}
            </button>
          ))}
        </div>
        {noLeidas > 0 && (
          <button
            onClick={handleTodas}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Check className="h-3.5 w-3.5" />
            Marcar todas como leídas
          </button>
        )}
      </div>

      {loading ? (
        <SkeletonCardList count={4} />
      ) : visibles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-950">
          <CheckCircle className="h-10 w-10 text-emerald-500" />
          <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            {filtro === "no_leidas" ? "Sin notificaciones nuevas" : "Sin notificaciones"}
          </p>
          <p className="mt-1 text-sm text-slate-500">Todo está al día.</p>
        </div>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {visibles.map((n) => {
              const isSelected = selected?.id === n.id;
              return (
                <article
                  key={n.id}
                  onClick={() => setSelected(n)}
                  className={`cursor-pointer rounded-2xl border p-5 shadow-sm transition-colors hover:border-brand-400 hover:bg-brand-50 dark:hover:border-brand-500 dark:hover:bg-slate-900 ${
                    isSelected
                      ? "border-brand-400 bg-brand-50 dark:border-brand-500 dark:bg-slate-900"
                      : n.leida
                        ? "border-slate-200 bg-white opacity-60 dark:border-slate-800 dark:bg-slate-950"
                        : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{n.titulo}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                            {n.mensaje}
                          </p>
                        </div>
                        {!n.leida && (
                          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                        )}
                      </div>
                      <p className="mt-2 text-xs text-slate-400">{timeAgo(n.creadaEn)}</p>
                    </div>
                    {!n.leida && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeida(n.id);
                        }}
                        className="shrink-0 rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 dark:border-slate-700 dark:hover:bg-emerald-950/30"
                        title="Marcar como leída"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Panel lateral */}
          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            {selected ? (
              <div>
                <div className="mb-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
                    Detalle
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
                    {selected.titulo}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">{timeAgo(selected.creadaEn)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                  <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                    {selected.mensaje}
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  {!selected.leida && (
                    <button
                      onClick={() => handleLeida(selected.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                    >
                      <Check className="h-4 w-4" />
                      Marcar como leída
                    </button>
                  )}
                  <button
                    onClick={() => setSelected(null)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Resumen
                </p>
                <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
                  Actividad
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Selecciona una notificación para ver su detalle.
                </p>
                <div className="mt-6 space-y-3">
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                      {todas.length}
                    </p>
                  </div>
                  {noLeidas > 0 && (
                    <div className="rounded-2xl bg-red-50 p-4 dark:bg-red-950/30">
                      <p className="text-xs text-red-500">No leídas</p>
                      <p className="mt-1 text-2xl font-bold text-red-700 dark:text-red-300">
                        {noLeidas}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>
        </section>
      )}
    </div>
  );
}
