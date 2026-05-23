"use client";

import { motion } from "framer-motion";
import { PawPrint, Calendar, Syringe, FileText } from "lucide-react";

const cards = [
  {
    icon: PawPrint,
    label: "Mascotas Registradas",
    value: "3",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Calendar,
    label: "Próxima Cita",
    value: "15 May",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Syringe,
    label: "Vacunas Pendientes",
    value: "2",
    color: "from-amber-500 to-amber-600",
  },
  {
    icon: FileText,
    label: "Historiales",
    value: "12",
    color: "from-purple-500 to-purple-600",
  },
];

export default function DashboardCards() {
  return (
    <>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${card.color} p-3`}>
              <Icon size={24} className="text-white" />
            </div>
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
          </motion.div>
        );
      })}
    </>
  );
}
