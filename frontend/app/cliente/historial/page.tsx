"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchCitas } from "../../../lib/api/citas";
import type { Appointment } from "../../../lib/recepcionista/types";
import { SkeletonStats, SkeletonCardList } from "../../components/ui/Skeleton";
import { StatusBadge } from "../../../lib/utils/status-badge";
import type { AppointmentStatus } from "../../../lib/utils/status";
import { Search, PawPrint, CalendarDays, History } from "lucide-react";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function agruparPorMes(citas: Appointment[]): { etiqueta: string; items: Appointment[] }[] {
  const map = new Map<string, { etiqueta: string; items: Appointment[] }>();
  for (const c of citas) {
    if (!c.date) continue;
    const d = new Date(c.date + "T00:00:00");
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const etiqueta = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    if (!map.has(key)) map.set(key, { etiqueta, items: [] });
    map.get(key)!.items.push(c);
  }
  return [...map.entries()].sort(([a], [b]) => b.localeCompare(a)).map(([, value]) => value);
}

export default function ClientHistorialPage() {
  const [citas, setCitas] = useState<Appointment[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchCitas(Number(user.id))
      .then((data) => {
        setCitas(data.sort((a, b) => b.date.localeCompare(a.date)));
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [user]);

  const citasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return citas;
    const q = busqueda.toLowerCase();
    return citas.filter(
      (c) =>
        c.petName.toLowerCase().includes(q) ||
        c.service.toLowerCase().includes(q) ||
        (c.veterinarian ?? "").toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q),
    );
  }, [citas, busqueda]);

  const grupos = useMemo(() => agruparPorMes(citasFiltradas), [citasFiltradas]);

  const finalizadas = citas.filter((c) => c.status === "Finalizada").length;
  const canceladas = citas.filter((c) => c.status === "Cancelada").length;

  return (
    <div className="h-full overflow-y-auto bg-surface-50 px-6 py-8 dark:bg-surface-950">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-page-title">Historial Médico</h1>
        <p className="text-subtitle mt-2">
          Revisa el historial de consultas y tratamientos de tus mascotas.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-5 md:grid-cols-3">
        <StatCard title="Total consultas" value={citas.length} />
        <StatCard title="Finalizadas" value={finalizadas} color="green" />
        <StatCard title="Canceladas" value={canceladas} color="red" />
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="flex h-11 max-w-md items-center gap-3 rounded-xl border border-surface-200 bg-white px-4 transition-colors focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400/10 dark:border-surface-700 dark:bg-surface-900">
          <Search className="h-[18px] w-[18px] shrink-0 text-surface-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por mascota, servicio, veterinario..."
            className="w-full bg-transparent text-sm text-surface-900 outline-none placeholder:text-surface-400 dark:text-white"
          />
        </div>
      </div>

      {/* Content */}
      {cargando ? (
        <div className="space-y-6">
          <SkeletonStats count={3} />
          <SkeletonCardList count={5} />
        </div>
      ) : grupos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-300 bg-white py-20 text-center dark:border-surface-700 dark:bg-surface-900">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <History className="h-7 w-7" />
          </div>
          <p className="text-sm font-semibold text-surface-900 dark:text-white">
            {busqueda ? "No se encontraron resultados" : "No hay historial disponible"}
          </p>
          <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
            {busqueda
              ? "Intenta con otro término de búsqueda."
              : "Las consultas de tus mascotas aparecerán aquí."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grupos.map(({ etiqueta, items }) => (
            <div key={etiqueta}>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-caption">{etiqueta}</h2>
                <span className="h-px flex-1 bg-surface-200 dark:bg-surface-700" />
                <span className="rounded-lg bg-surface-100 px-2.5 py-0.5 text-xs font-semibold text-surface-500 dark:bg-surface-800 dark:text-surface-400">
                  {items.length}
                </span>
              </div>

              <div className="space-y-3">
                {items.map((c) => (
                  <article
                    key={c.id}
                    className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover dark:border-surface-700 dark:bg-surface-900"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                          <PawPrint className="h-[22px] w-[22px]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-surface-900 dark:text-white">
                              {c.petName || "—"}
                            </p>
                            <StatusBadge status={c.status as AppointmentStatus} />
                          </div>
                          <p className="mt-1 text-sm text-surface-600 dark:text-surface-300">
                            {c.service || "Consulta"}
                          </p>
                          {c.veterinarian && (
                            <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                              Dr. {c.veterinarian}
                            </p>
                          )}
                          {c.notes && (
                            <p className="mt-2 rounded-lg bg-surface-50 px-3 py-2 text-xs text-surface-500 dark:bg-surface-950 dark:text-surface-400">
                              {c.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                        <CalendarDays className="h-[15px] w-[15px]" />
                        <span>
                          {c.date
                            ? new Date(c.date + "T00:00:00").toLocaleDateString("es-CO", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                          {c.time ? ` · ${c.time}` : ""}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color?: "green" | "red";
}) {
  const colorClass =
    color === "green"
      ? "text-success-600 dark:text-success-400"
      : color === "red"
        ? "text-danger-600 dark:text-danger-400"
        : "text-surface-900 dark:text-white";
  return (
    <article className="rounded-2xl border border-surface-200 bg-white px-5 py-4 shadow-card dark:border-surface-700 dark:bg-surface-900">
      <p className="text-label">{title}</p>
      <h3 className={`text-stat-sm mt-2 ${colorClass}`}>{value}</h3>
    </article>
  );
}
