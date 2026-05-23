"use client";
import React from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const barData = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
  datasets: [{ 
    label: "Citas", 
    data: [70, 90, 80, 100, 110, 120], 
    backgroundColor: "#2563EB", 
    borderRadius: 8,
    borderSkipped: false,
  }],
};

const doughnutData = {
  labels: ["Consultas", "Estética", "Urgencias", "Vacunas"],
  datasets: [{ 
    data: [40, 25, 15, 20], 
    backgroundColor: ["#1D4ED8", "#3B82F6", "#60A5FA", "#93C5FD"],
    borderWidth: 2,
    borderColor: "#ffffff",
  }],
};

const ReportsCharts: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Charts Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Bar Chart - Citas por mes */}
        <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40">
          <div className="mb-6">
            <h3 className="text-xl font-semibold tracking-tight text-slate-900">
              Citas por Mes
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Tendencia mensual de citas agendadas
            </p>
          </div>
          <div className="h-80 w-full">
            <Bar 
              data={barData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { 
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: "rgba(15, 23, 42, 0.8)",
                    padding: 12,
                    cornerRadius: 8,
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: "rgba(226, 232, 240, 0.5)" }
                  },
                  x: {
                    grid: { display: false }
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* Doughnut Chart - Distribución de servicios */}
        <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40">
          <div className="mb-6">
            <h3 className="text-xl font-semibold tracking-tight text-slate-900">
              Distribución de Servicios
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Proporción de tipos de servicios
            </p>
          </div>
          <div className="flex h-80 items-center justify-center">
            <div className="w-full">
              <Doughnut 
                data={doughnutData} 
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        padding: 16,
                        font: { size: 13, weight: 500 },
                        color: "#64748b"
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsCharts;