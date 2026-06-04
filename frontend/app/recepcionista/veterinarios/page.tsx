"use client";

import { CalendarDays, Clock, Search, Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";
import { ui, veterinarians } from "../data";
import SearchInput from "../components/SearchInput";

export default function RecepcionistaVeterinariosPage() {
  const [search, setSearch] = useState("");

  const filteredVets = useMemo(() => {
    return veterinarians.filter((vet) =>
      `${vet.nombre} ${vet.especialidad} ${vet.estado}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-black text-[#1e293b]">
          Agenda de veterinarios
        </h2>
        <p className="text-sm font-medium text-[#64748b]">
          Consulta disponibilidad, horarios y citas asignadas para evitar doble reserva.
        </p>
      </section>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Filtrar por veterinario, especialidad o disponibilidad..."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {filteredVets.map((vet) => {
          return (
            <article key={vet.id} className={`${ui.card} ${ui.cardHover} p-5`}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb]">
                  <Stethoscope className="h-6 w-6" />
                </div>

                <span
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-black",
                    vet.estado === "Disponible"
                      ? "border-[#bbf7d0] bg-[#ecfdf5] text-[#10b981]"
                      : vet.estado === "Ocupado"
                        ? "border-[#fed7aa] bg-[#fff7ed] text-[#f59e0b]"
                        : "border-[#fecaca] bg-[#fef2f2] text-[#ef4444]",
                  ].join(" ")}
                >
                  {vet.estado}
                </span>
              </div>

              <h3 className="text-lg font-black text-[#1e293b]">
                {vet.nombre}
              </h3>
              <p className="mt-1 text-sm font-bold text-[#2563eb]">
                {vet.especialidad}
              </p>

              <div className="mt-4 space-y-3 rounded-2xl bg-[#f8fafc] p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-[#64748b]">
                  <Clock className="h-4 w-4 text-[#2563eb]" />
                  {vet.horario}
                </p>
                <p className="flex items-center gap-2 text-sm font-bold text-[#64748b]">
                  <CalendarDays className="h-4 w-4 text-[#2563eb]" />
                  {vet.citasHoy} citas hoy
                </p>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-xs font-black uppercase tracking-wide text-[#64748b]">
                  Citas asignadas
                </p>
                <p className="text-xs font-semibold text-[#64748b]">
                  Ver agenda completa en la sección de citas.
                </p>
              </div>

              <button className={`${ui.secondaryButton} mt-4 w-full`}>
                <Search className="mr-2 inline h-4 w-4" />
                Ver disponibilidad
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}
