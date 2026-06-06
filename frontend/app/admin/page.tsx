"use client";

import React, { useState, useEffect, useMemo } from "react";
import StatsCards from "../components/admin/StatsCards";
import NotificationsPanel from "../components/admin/NotificationsPanel";
import RegisterUserModal from "../components/admin/RegisterUserModal";
import { motion } from "framer-motion";
import { getCurrentUser } from "../../lib/auth";
import { fetchCitas } from "../../lib/api/citas";
import type { Appointment } from "../../lib/recepcionista/types";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

// Plugin inline: dibuja el valor encima de cada barra
const valueLabelsPlugin = {
  id: "valueLabels",
  afterDatasetsDraw(chart: ChartJS) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    meta.data.forEach((bar, i) => {
      const value = chart.data.datasets[0].data[i] as number;
      if (value > 0) {
        ctx.save();
        ctx.fillStyle = "#475569";
        ctx.font = "bold 11px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(String(value), bar.x, bar.y - 4);
        ctx.restore();
      }
    });
  },
};

const AdminDashboardPage: React.FC = () => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [citas, setCitas] = useState<Appointment[]>([]);
  const [userName] = useState(() => getCurrentUser()?.name ?? "Administrador");

  useEffect(() => {
    fetchCitas()
      .then(setCitas)
      .catch(() => setCitas([]));
  }, []);

  const chartData = useMemo(() => {
    const hoy = new Date();
    const desde = new Date(hoy);
    desde.setDate(hoy.getDate() - 29);
    const hasta = new Date(hoy);
    hasta.setDate(hoy.getDate() + 14);

    const fechas: string[] = [];
    const cur = new Date(desde);
    while (cur <= hasta) {
      fechas.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }

    const todayStr = hoy.toISOString().slice(0, 10);
    const conteo: Record<string, number> = {};
    citas
      .filter((c) => c.status !== "Cancelada")
      .forEach((c) => {
        if (c.date) conteo[c.date] = (conteo[c.date] ?? 0) + 1;
      });

    const fechasConDatos = fechas.filter((f) => conteo[f] || f === todayStr);

    return {
      labels: fechasConDatos.map((f) => {
        const [, m, d] = f.split("-");
        return `${d}/${m}`;
      }),
      datasets: [
        {
          label: "Citas",
          data: fechasConDatos.map((f) => conteo[f] ?? 0),
          backgroundColor: fechasConDatos.map((f) =>
            f === todayStr ? "#4a87c3" : f < todayStr ? "#90c1ed" : "#bcdaf4",
          ),
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }, [citas]);

  return (
    <div className="admin-page">
      {/* Banner de bienvenida */}
      <motion.div
        className="admin-header-banner mb-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-200">
              Panel administrativo
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Hola, {userName}</h1>
            <p className="max-w-xl text-sm leading-6 text-brand-100">
              Desde aquí puedes gestionar usuarios, revisar citas pendientes, consultar el registro
              de mascotas y monitorear la actividad del sistema.
            </p>
          </div>
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50 active:scale-[0.98]"
          >
            + Nuevo usuario
          </button>
        </div>
      </motion.div>

      {/* Indicadores */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <StatsCards />
      </motion.div>

      {/* Gráfica + Notificaciones */}
      <motion.div
        className="grid gap-8 xl:grid-cols-[1fr_360px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Gráfica de barras */}
        <div className="admin-card p-6">
          <div className="mb-1">
            <h2 className="text-section-title">Citas programadas por día</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Últimos 30 días y próximos 14 ·{" "}
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-sm bg-brand-600" /> Hoy
              </span>
              <span className="ml-3 inline-flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-sm bg-brand-300" /> Pasado
              </span>
              <span className="ml-3 inline-flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-sm bg-brand-100" /> Próximo
              </span>
            </p>
          </div>
          <div className="mt-4 h-60 w-full">
            <Bar
              data={chartData}
              plugins={[valueLabelsPlugin]}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: "rgba(15,23,42,0.9)",
                    padding: 12,
                    cornerRadius: 10,
                    titleColor: "#e2e8f0",
                    bodyColor: "#94a3b8",
                    callbacks: {
                      title: (items) => {
                        const idx = items[0]?.dataIndex ?? 0;
                        return `Fecha: ${chartData.labels[idx] ?? ""}`;
                      },
                      label: (item) => `  ${item.raw} cita${Number(item.raw) !== 1 ? "s" : ""}`,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    suggestedMax: 5,
                    ticks: { stepSize: 1, color: "#94a3b8", font: { size: 11 } },
                    grid: { color: "rgba(226,232,240,0.6)" },
                    border: { display: false },
                  },
                  x: {
                    ticks: { color: "#94a3b8", font: { size: 10 }, maxRotation: 40 },
                    grid: { display: false },
                    border: { display: false },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Notificaciones */}
        <NotificationsPanel />
      </motion.div>

      <RegisterUserModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
};

export default AdminDashboardPage;
