"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  Clock,
  Heart,
  Pill,
  Scissors,
  Stethoscope,
  Syringe,
  Thermometer,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const vetStats = [
  {
    title: "Pacientes atendidos hoy",
    value: "24",
    change: "+12%",
    icon: Users,
    color: "bg-blue-100 text-blue-600",
    trend: "up",
  },
  {
    title: "Cirugías realizadas",
    value: "3",
    change: "+50%",
    icon: Scissors,
    color: "bg-emerald-100 text-emerald-600",
    trend: "up",
  },
  {
    title: "Vacunas aplicadas",
    value: "18",
    change: "+8%",
    icon: Syringe,
    color: "bg-sky-100 text-sky-600",
    trend: "up",
  },
  {
    title: "Consultas urgentes",
    value: "7",
    change: "-15%",
    icon: Zap,
    color: "bg-amber-100 text-amber-600",
    trend: "down",
  },
  {
    title: "Tiempo promedio consulta",
    value: "32min",
    change: "-5%",
    icon: Clock,
    color: "bg-purple-100 text-purple-600",
    trend: "down",
  },
  {
    title: "Satisfacción clientes",
    value: "4.8/5",
    change: "+2%",
    icon: Heart,
    color: "bg-rose-100 text-rose-600",
    trend: "up",
  },
];

const quickActions = [
  {
    title: "Nueva cita",
    icon: Calendar,
    color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    title: "Registro paciente",
    icon: Heart,
    color: "bg-emerald-600 hover:bg-emerald-700",
  },
  {
    title: "Inventario",
    icon: Pill,
    color: "bg-purple-600 hover:bg-purple-700",
  },
  {
    title: "Reportes",
    icon: TrendingUp,
    color: "bg-indigo-600 hover:bg-indigo-700",
  },
];

export default function AppointmentsTable() {
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Panel veterinario</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Estadísticas en tiempo real y acciones rápidas para una gestión eficiente de la clínica.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <motion.button
              key={action.title}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition duration-300 ${action.color}`}
            >
              <action.icon className="h-4 w-4" />
              {action.title}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vetStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.article
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className={`h-4 w-4 ${stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`} />
                  <span className={`text-xs font-semibold ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-3xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
                <p className="mt-2 text-sm font-medium text-slate-600">{stat.title}</p>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Additional Info Cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-600 text-white">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">Próxima cita</p>
              <p className="text-sm text-slate-600">Luna - Consulta general</p>
              <p className="text-xs text-slate-500">En 15 minutos</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-600 text-white">
              <Thermometer className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">Alertas del día</p>
              <p className="text-sm text-slate-600">2 vacunas pendientes</p>
              <p className="text-xs text-slate-500">Recordatorios enviados</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
