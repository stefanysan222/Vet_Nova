"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

const notifications = [
  {
    id: 1,
    title: "Recordatorio de Vacunación",
    message: "Max necesita la vacuna anual",
    time: "Hace 2 horas",
    icon: AlertCircle,
    color: "bg-amber-100 text-amber-600",
  },
  {
    id: 2,
    title: "Cita Confirmada",
    message: "Tu cita con Dr. García para el 15 de May está confirmada",
    time: "Hace 1 día",
    icon: CheckCircle,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    id: 3,
    title: "Mensaje del Veterinario",
    message: "Resultados del examen de Luna disponibles",
    time: "Hace 2 días",
    icon: Info,
    color: "bg-blue-100 text-blue-600",
  },
];

export default function NotificationsSection() {
  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Notificaciones</h2>
          <p className="text-sm text-slate-500">Actualizaciones recientes</p>
        </div>
        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          Ver todas
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif, idx) => {
          const Icon = notif.icon;
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-4 transition hover:shadow-md"
            >
              <div className={`rounded-2xl ${notif.color} flex h-12 w-12 items-center justify-center`}>
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{notif.title}</p>
                <p className="text-sm text-slate-600">{notif.message}</p>
                <p className="mt-2 text-xs text-slate-400">{notif.time}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
