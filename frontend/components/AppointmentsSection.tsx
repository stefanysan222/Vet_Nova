"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

const appointments = [
  {
    id: 1,
    date: "15 May 2026",
    time: "09:00 AM",
    vet: "Dr. Carlos García",
    pet: "Max",
    status: "Confirmada",
  },
  {
    id: 2,
    date: "20 May 2026",
    time: "02:00 PM",
    vet: "Dra. María López",
    pet: "Luna",
    status: "Pendiente",
  },
  {
    id: 3,
    date: "25 May 2026",
    time: "10:30 AM",
    vet: "Dr. Pablo Ruiz",
    pet: "Rocky",
    status: "Confirmada",
  },
];

export default function AppointmentsSection() {
  return (
    <div className="mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Próximas Citas</h2>
        <p className="text-sm text-slate-500">Tu agenda de citas programadas</p>
      </div>

      <div className="space-y-3">
        {appointments.map((apt, idx) => (
          <motion.div
            key={apt.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 transition hover:shadow-md"
          >
            <div className="flex flex-1 items-center gap-4">
              <div className="rounded-2xl bg-blue-100 p-3">
                <Clock size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{apt.date}</p>
                <p className="text-sm text-slate-500">{apt.time} • {apt.vet}</p>
              </div>
              <span className="hidden text-sm font-medium text-slate-600 sm:block">{apt.pet}</span>
            </div>
            <div className="flex items-center gap-2">
              {apt.status === "Confirmada" ? (
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-600">
                  <CheckCircle size={14} />
                  <span className="text-xs font-semibold">{apt.status}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-amber-600">
                  <AlertCircle size={14} />
                  <span className="text-xs font-semibold">{apt.status}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
