"use client";

import { useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "../../../lib/auth";
import { fetchCitas } from "../../../lib/api/citas";
import type { Appointment } from "../../../lib/recepcionista/types";

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
  const map = new Map<string, Appointment[]>();
  for (const c of citas) {
    if (!c.date) continue;
    const d = new Date(c.date + "T00:00:00");
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
    if (!map.has(key + "__label"))
      map.set(key + "__label", [{ id: label } as unknown as Appointment]);
  }
  const entries: { etiqueta: string; items: Appointment[] }[] = [];
  const keys = [...map.keys()]
    .filter((k) => !k.endsWith("__label"))
    .sort((a, b) => b.localeCompare(a));
  for (const key of keys) {
    const labelArr = map.get(key + "__label");
    const etiqueta = labelArr ? String((labelArr[0] as unknown as { id: string }).id) : key;
    entries.push({ etiqueta, items: map.get(key) ?? [] });
  }
  return entries;
}

function estadoBadge(status: string) {
  const styles: Record<string, string> = {
    Finalizada: "bg-[#DDF5DE] text-[#2F9E44] dark:bg-[#123B22] dark:text-[#86EFAC]",
    Cancelada: "bg-[#FFE4E6] text-[#E11D48] dark:bg-[#4C0519] dark:text-[#FDA4AF]",
    "No asistió": "bg-[#FEF3C7] text-[#B45309] dark:bg-[#78350F] dark:text-[#FDE68A]",
    Confirmada: "bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]",
    Pendiente: "bg-[#F1F5F9] text-[#475569] dark:bg-[#1E293B] dark:text-[#CBD5E1]",
    Reprogramada: "bg-[#EDE9FE] text-[#7C3AED] dark:bg-[#4C1D95] dark:text-[#DDD6FE]",
  };
  return styles[status] ?? styles.Pendiente;
}

export default function ClientHistorialPage() {
  const [citas, setCitas] = useState<Appointment[]>([]);
  const [cargando, setCargando] = useState(() => !!getCurrentUser());
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;
    fetchCitas(Number(user.id))
      .then((data) => {
        setCitas(data.sort((a, b) => b.date.localeCompare(a.date)));
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

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
    <div className="h-full overflow-y-auto bg-[#F5F7FB] px-6 py-8 dark:bg-[#0F172A]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold leading-none text-[#10213A] dark:text-white">
          Historial Médico
        </h1>
        <p className="mt-4 text-[16px] text-[#64748B] dark:text-[#94A3B8]">
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
        <div className="flex h-[44px] max-w-md items-center gap-3 rounded-xl border border-[#CBD5E1] bg-white px-4 focus-within:border-[#2F6BFF] focus-within:ring-2 focus-within:ring-[#2F6BFF]/10 dark:border-[#334155] dark:bg-[#111827]">
          <SearchIcon />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por mascota, servicio, veterinario..."
            className="w-full bg-transparent text-[14px] text-[#10213A] outline-none placeholder:text-[#94A3B8] dark:text-white"
          />
        </div>
      </div>

      {/* Content */}
      {cargando ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">Cargando historial...</p>
        </div>
      ) : grupos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#CBD5E1] bg-white py-20 text-center dark:border-[#334155] dark:bg-[#111827]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2F6BFF]">
            <HistorialIcon />
          </div>
          <p className="text-[16px] font-semibold text-[#10213A] dark:text-white">
            {busqueda ? "No se encontraron resultados" : "No hay historial disponible"}
          </p>
          <p className="mt-2 text-[14px] text-[#64748B] dark:text-[#94A3B8]">
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
                <h2 className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#64748B] dark:text-[#94A3B8]">
                  {etiqueta}
                </h2>
                <span className="h-px flex-1 bg-[#E2E8F0] dark:bg-[#334155]" />
                <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-[12px] font-semibold text-[#64748B] dark:bg-[#1E293B] dark:text-[#94A3B8]">
                  {items.length}
                </span>
              </div>

              <div className="space-y-3">
                {items.map((c) => (
                  <article
                    key={c.id}
                    className="rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2F6BFF]/50 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)] dark:border-[#334155] dark:bg-[#111827]"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2F6BFF] dark:bg-[#1E293B] dark:text-[#93C5FD]">
                          <PawIcon />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[15px] font-semibold text-[#10213A] dark:text-white">
                              {c.petName || "—"}
                            </p>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${estadoBadge(c.status)}`}
                            >
                              {c.status}
                            </span>
                          </div>
                          <p className="mt-1 text-[14px] text-[#475569] dark:text-[#CBD5E1]">
                            {c.service || "Consulta"}
                          </p>
                          {c.veterinarian && (
                            <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                              Dr. {c.veterinarian}
                            </p>
                          )}
                          {c.notes && (
                            <p className="mt-2 rounded-lg bg-[#F8FAFC] px-3 py-2 text-[13px] text-[#64748B] dark:bg-[#0F172A] dark:text-[#94A3B8]">
                              {c.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                        <CalendarIcon />
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
      ? "text-[#2F9E44]"
      : color === "red"
        ? "text-[#E11D48]"
        : "text-[#10213A] dark:text-white";
  return (
    <article className="rounded-xl border border-[#CBD5E1] bg-white px-5 py-4 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
      <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">{title}</p>
      <h3 className={`mt-2 text-[26px] font-bold ${colorClass}`}>{value}</h3>
    </article>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#94A3B8]">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PawIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 12.5c-2 0-3.5 1.5-3.5 3.4 0 2.2 1.8 3.6 4 3.6h7c2.2 0 4-1.4 4-3.6 0-1.9-1.5-3.4-3.5-3.4"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M9 8.5C9 10.4 8 12 6.7 12S4.5 10.4 4.5 8.5 5.5 5 6.7 5 9 6.6 9 8.5Zm10.5 0c0 1.9-1 3.5-2.2 3.5S15 10.4 15 8.5 16 5 17.3 5s2.2 1.6 2.2 3.5ZM14.5 8c0 2-1.1 3.6-2.5 3.6S9.5 10 9.5 8 10.6 4.4 12 4.4 14.5 6 14.5 8Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3v4M17 3v4M4.5 9.5h15M6.5 5h11a2 2 0 0 1 2 2v11.5a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HistorialIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 7v5l3.5 2M20.5 12a8.5 8.5 0 1 1-2.7-6.2M20.5 4.5v5h-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
