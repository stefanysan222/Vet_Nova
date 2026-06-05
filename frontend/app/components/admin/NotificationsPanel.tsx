"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CalendarDays, CheckCircle, Clock } from "lucide-react";
import { fetchCitas } from "../../../lib/api/citas";
import type { Appointment } from "../../../lib/recepcionista/types";

type NotifItem = {
  id: string;
  icon: React.ElementType;
  iconBg: string;
  title: string;
  desc: string;
  time: string;
  urgente: boolean;
};

function buildNotifications(citas: Appointment[]): NotifItem[] {
  const items: NotifItem[] = [];
  const hoy = new Date().toISOString().slice(0, 10);

  const pendientes = citas.filter((c) => c.status === "Pendiente");
  if (pendientes.length > 0) {
    items.push({
      id: "pendientes",
      icon: Clock,
      iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
      title: `${pendientes.length} cita${pendientes.length > 1 ? "s" : ""} pendiente${pendientes.length > 1 ? "s" : ""}`,
      desc: `Por confirmar: ${pendientes.slice(0, 2).map((c) => c.petName).join(", ")}${pendientes.length > 2 ? ` y ${pendientes.length - 2} más` : "."}`,
      time: "Ahora",
      urgente: pendientes.length >= 3,
    });
  }

  const citasHoy = citas.filter((c) => c.date === hoy && c.status !== "Cancelada");
  if (citasHoy.length > 0) {
    items.push({
      id: "hoy",
      icon: CalendarDays,
      iconBg: "bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400",
      title: `${citasHoy.length} cita${citasHoy.length > 1 ? "s" : ""} hoy`,
      desc: citasHoy.slice(0, 2).map((c) => `${c.petName} ${c.time ? `· ${c.time}` : ""}`).join(", "),
      time: "Hoy",
      urgente: false,
    });
  }

  if (items.length === 0) {
    items.push({
      id: "ok",
      icon: CheckCircle,
      iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
      title: "Todo en orden",
      desc: "No hay alertas activas en este momento.",
      time: "Ahora",
      urgente: false,
    });
  }

  return items;
}

const NotificationsPanel: React.FC = () => {
  const [items, setItems] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCitas()
      .then((citas) => setItems(buildNotifications(citas)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/40">
            <Bell className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          </div>
          <h3 className="text-section-title">Notificaciones</h3>
        </div>
        {!loading && items.some((i) => i.urgente) && (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-950/50 dark:text-red-400">
            Urgente
          </span>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          [1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ))
        ) : (
          items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 transition-shadow hover:shadow-xs ${
                  item.urgente
                    ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
                    : "border-slate-200/70 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400 line-clamp-2">{item.desc}</p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{item.time}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Link
        href="/admin/notificaciones"
        className="mt-5 flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        Ver todas las alertas
      </Link>
    </div>
  );
};

export default NotificationsPanel;
