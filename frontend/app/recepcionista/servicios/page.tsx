"use client";

import { CheckCircle2, Clock, Stethoscope, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { services, ui } from "../data";
import SearchInput from "../components/SearchInput";

export default function RecepcionistaServiciosPage() {
  const [search, setSearch] = useState("");

  const filteredServices = useMemo(() => {
    return services.filter((service) =>
      `${service.nombre} ${service.duracion} ${service.estado}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-black text-[#1e293b]">
          Servicios disponibles
        </h2>
        <p className="text-sm font-medium text-[#64748b]">
          Consulta servicios activos, duración estimada y si requieren veterinario asignable.
        </p>
      </section>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar servicio por nombre, duración o estado..."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredServices.map((service) => (
          <article key={service.id} className={`${ui.card} ${ui.cardHover} p-5`}>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb]">
                <Wrench className="h-6 w-6" />
              </div>

              <span
                className={[
                  "rounded-full border px-3 py-1 text-xs font-black",
                  service.estado === "Activo"
                    ? "border-[#bbf7d0] bg-[#ecfdf5] text-[#10b981]"
                    : "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]",
                ].join(" ")}
              >
                {service.estado}
              </span>
            </div>

            <h3 className="text-xl font-black text-[#1e293b]">
              {service.nombre}
            </h3>

            <div className="mt-4 space-y-3 rounded-2xl bg-[#f8fafc] p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-[#64748b]">
                <Clock className="h-4 w-4 text-[#2563eb]" />
                Duración estimada:{" "}
                <span className="text-[#1e293b]">{service.duracion}</span>
              </p>

              <p className="flex items-center gap-2 text-sm font-bold text-[#64748b]">
                <Stethoscope className="h-4 w-4 text-[#2563eb]" />
                Veterinario asignable:{" "}
                <span className="text-[#1e293b]">
                  {service.veterinarioAsignable}
                </span>
              </p>
            </div>

            <button className={`${ui.secondaryButton} mt-4 w-full`}>
              <CheckCircle2 className="mr-2 inline h-4 w-4" />
              Seleccionar para cita
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
