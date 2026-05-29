"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type DocumentoClinicoAdjunto = {
  id: string;
  nombre: string;
  tipo: string;
  tamano: number;
  fechaCarga: string;
  dataUrl?: string;
};

type Pet = {
  id: string;
  nombre: string;
  tipo: "perro" | "gato" | "otro";
  especie: string;
  raza: string;
  edad: string;
  dueño: string;
  ultimaVisita: string;
  estado: "Activo" | "En Tratamiento";
  foto: string | null;
  sexo?: string;
  fechaNacimiento?: string;
  peso?: string;
  color?: string;
  observaciones?: string;
  documentosClinicos?: DocumentoClinicoAdjunto[];
};

type SpeciesFilter = "todas" | "perro" | "gato" | "otro";

const PETS_STORAGE_KEY = "vetnova_mascotas_cliente";

const mascotasIniciales: Pet[] = [
  {
    id: "max",
    nombre: "Max",
    tipo: "perro",
    especie: "Perro",
    raza: "Golden Retriever",
    edad: "3 años",
    dueño: "Juan Pérez",
    ultimaVisita: "15 Abr 2026",
    estado: "Activo",
    foto: null,
    documentosClinicos: [],
  },
  {
    id: "luna",
    nombre: "Luna",
    tipo: "gato",
    especie: "Gato",
    raza: "Siamés",
    edad: "2 años",
    dueño: "María García",
    ultimaVisita: "20 Abr 2026",
    estado: "Activo",
    foto: null,
    documentosClinicos: [],
  },
  {
    id: "rocky",
    nombre: "Rocky",
    tipo: "perro",
    especie: "Perro",
    raza: "Pastor Alemán",
    edad: "5 años",
    dueño: "Carlos López",
    ultimaVisita: "02 May 2026",
    estado: "En Tratamiento",
    foto: null,
    documentosClinicos: [],
  },
  {
    id: "bella",
    nombre: "Bella",
    tipo: "gato",
    especie: "Gato",
    raza: "Persa",
    edad: "4 años",
    dueño: "Ana Martínez",
    ultimaVisita: "28 Abr 2026",
    estado: "Activo",
    foto: null,
    documentosClinicos: [],
  },
  {
    id: "charlie",
    nombre: "Charlie",
    tipo: "perro",
    especie: "Perro",
    raza: "Labrador",
    edad: "1 año",
    dueño: "Luis Ramírez",
    ultimaVisita: "30 Abr 2026",
    estado: "Activo",
    foto: null,
    documentosClinicos: [],
  },
  {
    id: "mia",
    nombre: "Mia",
    tipo: "gato",
    especie: "Gato",
    raza: "Angora",
    edad: "6 meses",
    dueño: "Sofía Torres",
    ultimaVisita: "01 May 2026",
    estado: "Activo",
    foto: null,
    documentosClinicos: [],
  },
];

export default function MascotasPage() {
  const [mascotas, setMascotas] = useState<Pet[]>(mascotasIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [especieSeleccionada, setEspecieSeleccionada] =
    useState<SpeciesFilter>("todas");

  useEffect(() => {
    const cargarMascotas = () => {
      try {
        const registroGuardado = localStorage.getItem(PETS_STORAGE_KEY);

        if (!registroGuardado) {
          setMascotas(mascotasIniciales);
          return;
        }

        const mascotasCreadas = JSON.parse(registroGuardado) as Pet[];

        setMascotas([...mascotasCreadas, ...mascotasIniciales]);
      } catch {
        localStorage.removeItem(PETS_STORAGE_KEY);
        setMascotas(mascotasIniciales);
      }
    };

    cargarMascotas();

    window.addEventListener("vetnova-pets-updated", cargarMascotas);
    window.addEventListener("storage", cargarMascotas);

    return () => {
      window.removeEventListener("vetnova-pets-updated", cargarMascotas);
      window.removeEventListener("storage", cargarMascotas);
    };
  }, []);

  const mascotasFiltradas = useMemo(() => {
    const termino = normalizarTexto(busqueda.trim());

    return mascotas.filter((mascota) => {
      const coincideBusqueda =
        termino === "" ||
        normalizarTexto(mascota.nombre).includes(termino) ||
        normalizarTexto(mascota.dueño).includes(termino) ||
        normalizarTexto(mascota.raza).includes(termino);

      const coincideEspecie =
        especieSeleccionada === "todas" ||
        mascota.tipo === especieSeleccionada;

      return coincideBusqueda && coincideEspecie;
    });
  }, [busqueda, especieSeleccionada, mascotas]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setEspecieSeleccionada("todas");
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F5F7FB] px-6 py-8 dark:bg-[#0F172A]">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold leading-none text-[#10213A] dark:text-white">
            Gestión de Mascotas
          </h1>

          <p className="mt-4 text-[16px] text-[#64748B] dark:text-[#94A3B8]">
            {mascotasFiltradas.length}{" "}
            {mascotasFiltradas.length === 1
              ? "mascota registrada"
              : "mascotas registradas"}
          </p>
        </div>

        <Link
          href="/cliente/mascotas/nueva"
          className="inline-flex h-[45px] items-center gap-2 rounded-xl bg-[#2F6BFF] px-5 text-[16px] font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#2457D6] hover:shadow-[0_10px_20px_rgba(47,107,255,0.28)]"
        >
          <PlusIcon />
          Nueva Mascota
        </Link>
      </div>

      <div className="mb-7 rounded-xl border border-[#CBD5E1] bg-white p-4 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="flex h-[46px] flex-1 items-center gap-3 rounded-xl border border-[#CBD5E1] bg-white px-4 transition-colors focus-within:border-[#2F6BFF] focus-within:ring-2 focus-within:ring-[#2F6BFF]/10 dark:border-[#334155] dark:bg-[#0F172A]">
            <SearchIcon />

            <input
              type="text"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por nombre, dueño o raza..."
              className="w-full bg-transparent text-[15px] text-[#10213A] outline-none placeholder:text-[#94A3B8] dark:text-white"
            />

            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                className="text-[#94A3B8] transition-colors hover:text-[#2F6BFF]"
                aria-label="Limpiar búsqueda"
              >
                <CloseIcon />
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-[205px]">
            <select
              value={especieSeleccionada}
              onChange={(event) =>
                setEspecieSeleccionada(event.target.value as SpeciesFilter)
              }
              className="h-[46px] w-full cursor-pointer appearance-none rounded-xl border border-[#CBD5E1] bg-white px-5 pr-11 text-[15px] text-[#10213A] outline-none transition-all hover:border-[#2F6BFF] focus:border-[#2F6BFF] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
            >
              <option value="todas">Todas las especies</option>
              <option value="perro">Perros</option>
              <option value="gato">Gatos</option>
              <option value="otro">Otros</option>
            </select>

            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#10213A] dark:text-white">
              <ChevronDownIcon />
            </div>
          </div>
        </div>
      </div>

      {mascotasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {mascotasFiltradas.map((mascota) => (
            <article
              key={mascota.id}
              className="group relative flex min-h-[220px] flex-col rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[#2F6BFF]/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF]"
            >
              <StatusBadge estado={mascota.estado} />

              <div className="flex items-start gap-4 pr-[76px]">
                <div className="relative flex h-[56px] w-[56px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#DBEAFE] text-[#2563EB] transition-all group-hover:scale-105 dark:bg-[#1E3A8A] dark:text-[#93C5FD]">
                  {mascota.foto ? (
                    <Image
                      src={mascota.foto}
                      alt={`Foto de ${mascota.nombre}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : mascota.tipo === "perro" ? (
                    <DogIcon />
                  ) : mascota.tipo === "gato" ? (
                    <CatIcon />
                  ) : (
                    <PetIcon />
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-[17px] font-semibold leading-none text-[#10213A] dark:text-white">
                    {mascota.nombre}
                  </h2>

                  <p className="mt-3 truncate text-[13px] text-[#52698A] dark:text-[#94A3B8]">
                    {mascota.especie} · {mascota.raza}
                  </p>

                  <p className="mt-2 text-[13px] text-[#52698A] dark:text-[#94A3B8]">
                    {mascota.edad}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#E2E8F0] pt-4 dark:border-[#334155]">
                <div className="min-w-0">
                  <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                    Propietario
                  </p>

                  <p className="mt-1 truncate text-[13px] font-semibold text-[#10213A] dark:text-white">
                    {mascota.dueño}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                    Última visita
                  </p>

                  <p className="mt-1 text-[13px] font-semibold text-[#10213A] dark:text-white">
                    {mascota.ultimaVisita}
                  </p>
                </div>
              </div>

              <Link
                href={`/cliente/mascotas/${encodeURIComponent(mascota.id)}`}
                className="mt-auto inline-flex items-center justify-center gap-1.5 pt-4 text-[13px] font-medium text-[#2F6BFF] transition-colors hover:text-[#2457D6] dark:text-[#60A5FA]"
              >
                Ver perfil completo
                <ChevronRightIcon />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-[#CBD5E1] bg-white px-6 text-center dark:border-[#334155] dark:bg-[#111827]">
          <div className="mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]">
            <SearchIcon />
          </div>

          <h2 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
            No se encontraron mascotas
          </h2>

          <p className="mt-3 text-[15px] text-[#64748B] dark:text-[#94A3B8]">
            Intenta buscar con otro nombre, dueño, raza o especie.
          </p>

          <button
            type="button"
            onClick={limpiarFiltros}
            className="mt-6 inline-flex h-[44px] items-center rounded-xl border border-[#CBD5E1] bg-white px-5 text-[15px] font-semibold text-[#10213A] transition-all hover:border-[#2F6BFF] hover:text-[#2F6BFF] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}

function normalizarTexto(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function StatusBadge({ estado }: { estado: Pet["estado"] }) {
  const estilos =
    estado === "Activo"
      ? "bg-[#DDF5DE] text-[#008B35] dark:bg-[#123B22] dark:text-[#86EFAC]"
      : "bg-[#FBE9A9] text-[#9A6700] dark:bg-[#4A3412] dark:text-[#FACC15]";

  return (
    <span
      className={`absolute right-4 top-4 rounded-full px-3 py-[5px] text-[11px] font-semibold leading-none ${estilos}`}
    >
      {estado}
    </span>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="m21 21-4.35-4.35M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="m9 18 6-6-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DogIcon() {
  return (
    <svg width="31" height="31" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 9 4 7v7c0 4 3.2 6 8 6s8-2 8-6V7l-3 2M9 14h.01M15 14h.01M10 17c1 .7 3 .7 4 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CatIcon() {
  return (
    <svg width="31" height="31" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 9 7 4l4 3h2l4-3 2 5v6c0 3-3 5-7 5s-7-2-7-5V9ZM9 13h.01M15 13h.01M10 16c1.1.6 2.9.6 4 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PetIcon() {
  return (
    <svg width="31" height="31" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 12.5c-2 0-3.5 1.5-3.5 3.4 0 2.2 1.8 3.6 4 3.6h7c2.2 0 4-1.4 4-3.6 0-1.9-1.5-3.4-3.5-3.4"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M9 8.5C9 10.4 8 12 6.7 12S4.5 10.4 4.5 8.5 5.5 5 6.7 5 9 6.6 9 8.5Zm10.5 0c0 1.9-1 3.5-2.2 3.5S15 10.4 15 8.5 16 5 17.3 5s2.2 1.6 2.2 3.5ZM14.5 8c0 2-1.1 3.6-2.5 3.6S9.5 10 9.5 8 10.6 4.4 12 4.4 14.5 6 14.5 8Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}