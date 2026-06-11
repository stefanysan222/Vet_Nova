"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle } from "lucide-react";
import {
  fetchNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
  type NotificacionAPI,
} from "../../../lib/api/notificaciones";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Ahora";
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h}h`;
  return `Hace ${Math.floor(h / 24)}d`;
}

const NotificationsPanel: React.FC = () => {
  const [items, setItems] = useState<NotificacionAPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotificaciones(true)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleLeida = async (id: number) => {
    await marcarLeida(id).catch(() => {});
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  const handleTodas = async () => {
    await marcarTodasLeidas().catch(() => {});
    setItems([]);
  };

  return (
    <div className="admin-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/40">
            <Bell className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          </div>
          <h3 className="text-section-title">Notificaciones</h3>
        </div>
        {!loading && items.length > 0 && (
          <button
            onClick={handleTodas}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Marcar todas leídas
          </button>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          [1, 2].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
            />
          ))
        ) : items.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-success-100 text-success-600 dark:bg-success-900/40 dark:text-success-400">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Todo en orden</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                No hay notificaciones nuevas.
              </p>
            </div>
          </div>
        ) : (
          items.slice(0, 4).map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{n.titulo}</p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {n.mensaje}
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {timeAgo(n.creadaEn)}
                </p>
              </div>
              <button
                onClick={() => handleLeida(n.id)}
                className="mt-0.5 shrink-0 rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-600 dark:hover:bg-slate-700"
                title="Marcar como leída"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <Link
        href="/admin/notificaciones"
        className="mt-5 flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        Ver todas las notificaciones
      </Link>
    </div>
  );
};

export default NotificationsPanel;
