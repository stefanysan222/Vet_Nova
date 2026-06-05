"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getCurrentUser } from "../../../lib/auth";
import { fetchPropietarioByUsuario } from "../../../lib/api/propietarios";
import { fetchMascotas } from "../../../lib/api/mascotas";

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

function espécieToTipo(especie: string): "perro" | "gato" | "otro" {
  const lower = especie.toLowerCase();
  if (lower.includes("perro") || lower.includes("canino")) return "perro";
  if (lower.includes("gato") || lower.includes("felino")) return "gato";
  return "otro";
}

export default function MascotasPage() {
  const [mascotas, setMascotas] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [especieSeleccionada, setEspecieSeleccionada] =
    useState<SpeciesFilter>("todas");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) { setLoading(false); return; }

    const cargarMascotas = async () => {
      try {
        const propietario = await fetchPropietarioByUsuario(user.id);
        if (!propietario) { setMascotas([]); return; }

        const apiMascotas = await fetchMascotas(parseInt(propietario.id, 10));
        const mapped: Pet[] = apiMascotas.map((m) => ({
          id: m.id,
          nombre: m.nombre,
          tipo: espécieToTipo(m.especie),
          especie: m.especie || "Otro",
          raza: m.raza || "—",
          edad: m.edad || "—",
          dueño: propietario.name,
          ultimaVisita: "—",
          estado: "Activo",
          foto: m.foto || null,
          sexo: m.sexo,
          fechaNacimiento: m.fechaNacimiento,
          peso: m.peso,
          documentosClinicos: [],
        }));
        setMascotas(mapped);
      } catch {
        setMascotas([]);
      } finally {
        setLoading(false);
      }
    };

    cargarMascotas();
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
    <div className="h-full overflow-y-auto admin-page">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-page-title">Mis mascotas</h1>
          <p className="mt-2 text-subtitle">
            {mascotasFiltradas.length}{" "}
            {mascotasFiltradas.length === 1 ? "mascota registrada" : "mascotas registradas"}
          </p>
        </div>

        <Link href="/cliente/mascotas/nueva" className="btn-primary whitespace-nowrap">
          <PlusIcon />
          Nueva mascota
        </Link>
      </div>

      <div className="admin-card mb-6 p-4">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="flex h-[46px] flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition-colors focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400/10 dark:border-slate-700 dark:bg-slate-900">
            <SearchIcon />

            <input
              type="text"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por nombre, dueño o raza..."
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
            />

            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                className="text-slate-400 transition-colors hover:text-brand-600"
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
              className="h-[46px] w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-5 pr-11 text-sm text-slate-900 outline-none transition-all hover:border-brand-400 focus:border-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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
          {mascotasFiltradas.map((mascota, i) => (
            <motion.article
              key={mascota.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="group relative flex min-h-[220px] flex-col admin-card p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <StatusBadge estado={mascota.estado} />

              <div className="flex items-start gap-4 pr-[76px]">
                <div className="relative flex h-[56px] w-[56px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-50 text-brand-600 transition-all group-hover:scale-105 dark:bg-brand-900/30 dark:text-brand-400">
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
                  <h2 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                    {mascota.nombre}
                  </h2>

                  <p className="mt-2 truncate text-sm text-slate-500 dark:text-slate-400">
                    {mascota.especie} · {mascota.raza}
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {mascota.edad}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between gap-4 border-t border-slate-200/80 pt-4 dark:border-slate-700">
                <div className="min-w-0">
                  <p className="text-label">Propietario</p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {mascota.dueño}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-label">Última visita</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {mascota.ultimaVisita}
                  </p>
                </div>
              </div>

              <Link
                href={`/cliente/mascotas/${encodeURIComponent(mascota.id)}`}
                className="mt-auto inline-flex items-center justify-center gap-1.5 pt-4 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400"
              >
                Ver perfil completo
                <ChevronRightIcon />
              </Link>
            </motion.article>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center shadow-xs dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <SearchIcon />
          </div>
          <h2 className="text-section-title">No se encontraron mascotas</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Intenta buscar con otro nombre, dueño, raza o especie.
          </p>
          <button type="button" onClick={limpiarFiltros} className="mt-5 btn-secondary">
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
  const { badge, dot } =
    estado === "Activo"
      ? { badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", dot: "bg-emerald-500" }
      : { badge: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", dot: "bg-amber-500" };

  return (
    <span className={`absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
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