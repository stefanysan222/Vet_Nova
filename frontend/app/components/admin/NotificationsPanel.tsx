import React from "react";
import { Bell } from "lucide-react";

const notifications = [
  { icon: "📅", title: "Nueva cita agendada", desc: "El cliente Ana Pérez reservó una consulta para Milo.", time: "2 min atrás", color: "bg-blue-50" },
  { icon: "⚠️", title: "Inventario bajo", desc: "Quedan menos de 10 unidades de alimento premium.", time: "12 min atrás", color: "bg-amber-50" },
  { icon: "✅", title: "Usuario registrado", desc: "Nuevo recepcionista agregado al sistema.", time: "45 min atrás", color: "bg-emerald-50" },
];

const NotificationsPanel: React.FC = () => {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40 dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-900/40">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Notificaciones
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((note, i) => (
          <div
            key={i}
            className={`rounded-2xl border border-slate-200/50 ${note.color} p-4 transition hover:shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:hover:shadow-slate-900/20`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0 text-lg">{note.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{note.title}</p>
                <p className="mt-1 text-sm text-slate-600 line-clamp-2">{note.desc}</p>
                <p className="mt-2 text-xs text-slate-400">{note.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-6 w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
        Ver todas las notificaciones
      </button>
    </div>
  );
};

export default NotificationsPanel;