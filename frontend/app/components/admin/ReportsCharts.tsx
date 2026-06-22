"use client";
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { CHART_COLORS } from "../../../lib/chart-colors";

const barData = [
  { mes: "Ene", citas: 70 },
  { mes: "Feb", citas: 90 },
  { mes: "Mar", citas: 80 },
  { mes: "Abr", citas: 100 },
  { mes: "May", citas: 110 },
  { mes: "Jun", citas: 120 },
];

const pieData = [
  { name: "Consultas", value: 40, color: CHART_COLORS.primary },
  { name: "Estética", value: 25, color: CHART_COLORS.secondary },
  { name: "Urgencias", value: 15, color: CHART_COLORS.tertiary },
  { name: "Vacunas", value: 20, color: CHART_COLORS.future },
];

const ReportsCharts: React.FC = () => {
  const [hiddenSlices, setHiddenSlices] = useState<Set<string>>(new Set());

  const toggleSlice = (name: string) =>
    setHiddenSlices((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const visiblePieData = pieData.filter((d) => !hiddenSlices.has(d.name));

  return (
    <div className="space-y-8">
      {/* Charts Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Bar Chart - Citas por mes */}
        <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40 dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-900/40">
          <div className="mb-6">
            <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Citas por Mes
            </h3>
            <p className="mt-1 text-sm text-slate-500">Tendencia mensual de citas agendadas</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid vertical={false} stroke={CHART_COLORS.gridLine} />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 12, fill: CHART_COLORS.axisLabel }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: CHART_COLORS.axisLabel }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(99,102,241,0.06)" }}
                  contentStyle={{
                    background: CHART_COLORS.tooltipBg,
                    border: "none",
                    borderRadius: 8,
                    padding: 12,
                    color: CHART_COLORS.tooltipTitle,
                  }}
                  labelStyle={{ color: CHART_COLORS.tooltipTitle }}
                  itemStyle={{ color: CHART_COLORS.tooltipBody }}
                />
                <Bar
                  dataKey="citas"
                  name="Citas"
                  fill={CHART_COLORS.primary}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Distribución de servicios */}
        <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40 dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-900/40">
          <div className="mb-6">
            <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Distribución de Servicios
            </h3>
            <p className="mt-1 text-sm text-slate-500">Proporción de tipos de servicios</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visiblePieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {visiblePieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: CHART_COLORS.tooltipBg,
                    border: "none",
                    borderRadius: 8,
                    padding: 12,
                    color: CHART_COLORS.tooltipTitle,
                  }}
                  itemStyle={{ color: CHART_COLORS.tooltipBody }}
                />
                <Legend
                  verticalAlign="bottom"
                  onClick={(entry) => toggleSlice(String(entry.value))}
                  formatter={(value) => (
                    <span
                      className="cursor-pointer text-[13px] font-medium"
                      style={{
                        color: CHART_COLORS.axisLabel,
                        opacity: hiddenSlices.has(String(value)) ? 0.4 : 1,
                      }}
                    >
                      {value}
                    </span>
                  )}
                  wrapperStyle={{ paddingTop: 16 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsCharts;
