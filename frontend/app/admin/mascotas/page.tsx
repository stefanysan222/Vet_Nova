"use client";

import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, FileText, Info, PawPrint, Plus } from "lucide-react";
import { fetchMascotas, createMascota } from "../../../lib/api/mascotas";
import { fetchPropietarios } from "../../../lib/api/propietarios";
import { fetchCitas } from "../../../lib/api/citas";
import { StatusBadge } from "../../../lib/utils/status-badge";
import type { PetRecord, Owner, Appointment } from "../../../lib/recepcionista/types";
import { SkeletonCardList } from "../../components/ui/Skeleton";

type Tab = "info" | "historial";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

function parseNotas(notas?: string): Record<string, string> | null {
  if (!notas) return null;
  try {
    const parsed = JSON.parse(notas);
    if (typeof parsed === "object" && parsed !== null) return parsed;
  } catch {
    /* not JSON */
  }
  return null;
}

function PetAvatar({ pet, size = "md" }: { pet: PetRecord; size?: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: "h-9 w-9 text-sm", md: "h-12 w-12 text-base", lg: "h-20 w-20 text-2xl" };
  const colors: Record<string, string> = {
    Canino: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    Felino: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    Otro: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  };
  const color = colors[pet.especie] ?? colors["Otro"];
  return (
    <div
      className={`${sizeMap[size]} ${color} flex shrink-0 items-center justify-center rounded-2xl font-bold`}
    >
      {pet.foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={pet.foto} alt={pet.nombre} className="h-full w-full rounded-2xl object-cover" />
      ) : (
        (pet.nombre[0]?.toUpperCase() ?? "?")
      )}
    </div>
  );
}

function DetailModal({
  pet,
  citas,
  loadingCitas,
  onClose,
}: {
  pet: PetRecord;
  citas: Appointment[];
  loadingCitas: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("info");
  const historial = citas
    .filter((c) => c.petId === pet.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        transition={{ type: "spring", bounce: 0.18, duration: 0.38 }}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-slate-100 p-6 dark:border-slate-800">
          <PetAvatar pet={pet} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              {pet.especie}
            </p>
            <h2 className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">
              {pet.nombre}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {pet.raza || "Raza no especificada"} · Propietario: {pet.propietarioNombre || "—"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 dark:border-slate-800">
          {(
            [
              { id: "info" as Tab, label: "Información", icon: Info },
              { id: "historial" as Tab, label: "Historial clínico", icon: FileText },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                tab === id
                  ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {id === "historial" && historial.length > 0 && (
                <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                  {historial.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "info" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: "Edad", value: pet.edad || "—" },
                  { label: "Peso", value: pet.peso || "—" },
                  { label: "Sexo", value: pet.sexo },
                  { label: "Especie", value: pet.especie || "—" },
                  { label: "Raza", value: pet.raza || "—" },
                  { label: "Fecha de nac.", value: pet.fechaNacimiento || "—" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 dark:text-slate-400">Propietario</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {pet.propietarioNombre || "No registrado"}
                </p>
              </div>
            </div>
          )}

          {tab === "historial" && (
            <div>
              {loadingCitas ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
                    />
                  ))}
                </div>
              ) : historial.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No hay historial clínico registrado para esta mascota.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historial.map((cita) => {
                    const notas = parseNotas(cita.notes);
                    return (
                      <div
                        key={cita.id}
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-xs text-slate-400">
                              {cita.date} · {cita.time || "—"}
                            </p>
                            <p className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                              {cita.service || "Consulta general"}
                            </p>
                            {cita.veterinarian && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Dr. {cita.veterinarian}
                              </p>
                            )}
                          </div>
                          <StatusBadge status={cita.status} />
                        </div>

                        {/* Notas clínicas */}
                        {notas ? (
                          <div className="mt-3 space-y-1.5 border-t border-slate-200/70 pt-3 dark:border-slate-700">
                            {Object.entries(notas).map(([k, v]) =>
                              v ? (
                                <div key={k} className="flex gap-2 text-sm">
                                  <span className="w-28 shrink-0 font-medium capitalize text-slate-500 dark:text-slate-400">
                                    {k.replace(/_/g, " ")}:
                                  </span>
                                  <span className="text-slate-700 dark:text-slate-300">{v}</span>
                                </div>
                              ) : null,
                            )}
                          </div>
                        ) : cita.notes ? (
                          <p className="mt-3 border-t border-slate-200/70 pt-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                            {cita.notes}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MascotasPage() {
  const [pets, setPets] = useState<PetRecord[]>([]);
  const [propietarios, setPropietarios] = useState<Owner[]>([]);
  const [citas, setCitas] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [selectedPet, setSelectedPet] = useState<PetRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filtroEspecie, setFiltroEspecie] = useState<"todas" | "Canino" | "Felino" | "Otro">(
    "todas",
  );
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    especie: "Canino",
    raza: "",
    edad: "",
    peso: "",
    sexo: "No especificado",
    propietarioId: "",
  });

  const cargar = () => {
    setLoading(true);
    Promise.all([fetchMascotas(), fetchPropietarios()])
      .then(([p, prop]) => {
        setPets(p);
        setPropietarios(prop);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, []);

  useEffect(() => {
    fetchCitas()
      .then(setCitas)
      .catch(() => setCitas([]))
      .finally(() => setLoadingCitas(false));
  }, []);

  const petsFiltradas = useMemo(() => {
    return pets.filter((p) => {
      const matchSearch =
        !search ||
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (p.propietarioNombre ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (p.raza ?? "").toLowerCase().includes(search.toLowerCase());
      const matchEspecie = filtroEspecie === "todas" || p.especie === filtroEspecie;
      return matchSearch && matchEspecie;
    });
  }, [pets, search, filtroEspecie]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }
    if (!form.propietarioId) {
      setFormError("Selecciona un propietario.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await createMascota({
        nombre: form.nombre.trim(),
        especie: form.especie,
        raza: form.raza.trim() || "",
        edad: form.edad.trim() || "",
        peso: form.peso.trim() || "",
        sexo: form.sexo as PetRecord["sexo"],
        foto: "",
        propietarioId: form.propietarioId,
      });
      setShowForm(false);
      setForm({
        nombre: "",
        especie: "Canino",
        raza: "",
        edad: "",
        peso: "",
        sexo: "No especificado",
        propietarioId: "",
      });
      cargar();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al registrar la mascota.");
    } finally {
      setSaving(false);
    }
  };

  const especieCounts = useMemo(
    () => ({
      Canino: pets.filter((p) => p.especie === "Canino").length,
      Felino: pets.filter((p) => p.especie === "Felino").length,
      Otro: pets.filter((p) => p.especie !== "Canino" && p.especie !== "Felino").length,
    }),
    [pets],
  );

  return (
    <>
      <div className="admin-page">
        <section className="admin-card-padded">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-eyebrow">Mascotas</p>
              <h1 className="text-page-title mt-2">Gestión de mascotas</h1>
              <p className="text-subtitle mt-1">
                Consulta información y historial clínico de cada paciente.
              </p>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-primary shrink-0">
              <Plus className="h-4 w-4" />
              Nueva mascota
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <article className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {loading ? "—" : pets.length}
              </p>
            </article>
            <article className="rounded-2xl border border-amber-200/70 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Caninos</p>
              <p className="mt-1 text-2xl font-bold text-amber-800 dark:text-amber-300">
                {loading ? "—" : especieCounts.Canino}
              </p>
            </article>
            <article className="rounded-2xl border border-violet-200/70 bg-violet-50 p-4 dark:border-violet-900/50 dark:bg-violet-950/20">
              <p className="text-xs font-medium text-violet-600 dark:text-violet-400">Felinos</p>
              <p className="mt-1 text-2xl font-bold text-violet-800 dark:text-violet-300">
                {loading ? "—" : especieCounts.Felino}
              </p>
            </article>
            <article className="rounded-2xl border border-teal-200/70 bg-teal-50 p-4 dark:border-teal-900/50 dark:bg-teal-950/20">
              <p className="text-xs font-medium text-teal-600 dark:text-teal-400">Otros</p>
              <p className="mt-1 text-2xl font-bold text-teal-800 dark:text-teal-300">
                {loading ? "—" : especieCounts.Otro}
              </p>
            </article>
          </div>

          {/* Buscador + filtros */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Buscar por nombre, raza o propietario..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["todas", "Canino", "Felino", "Otro"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltroEspecie(f)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    filtroEspecie === f
                      ? "bg-brand-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {f === "todas" ? "Todas" : f}
                </button>
              ))}
            </div>
          </div>

          {/* Lista */}
          <div className="mt-5">
            {loading ? (
              <div>
                <SkeletonCardList count={4} />
              </div>
            ) : petsFiltradas.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 py-14 text-center dark:border-slate-700 dark:bg-slate-800/40">
                <PawPrint className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {search || filtroEspecie !== "todas"
                    ? "No hay mascotas que coincidan con el filtro."
                    : "No hay mascotas registradas."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {petsFiltradas.map((pet) => {
                  const citasCount = citas.filter((c) => c.petId === pet.id).length;
                  return (
                    <button
                      key={pet.id}
                      onClick={() => setSelectedPet(pet)}
                      className="flex w-full items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 text-left transition hover:border-brand-200 hover:bg-brand-50/40 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-brand-700 dark:hover:bg-brand-950/20"
                    >
                      <PetAvatar pet={pet} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {pet.nombre}
                          </p>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                            {pet.especie}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
                          {pet.raza || "Sin raza"} · {pet.propietarioNombre || "Sin propietario"}
                        </p>
                      </div>
                      <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                        <span className="text-xs text-slate-400">{pet.edad || "—"}</span>
                        {citasCount > 0 && (
                          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                            {citasCount} {citasCount === 1 ? "cita" : "citas"}
                          </span>
                        )}
                      </div>
                      <svg
                        className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Contador */}
          {!loading && petsFiltradas.length > 0 && (
            <p className="mt-4 text-center text-xs text-slate-400">
              Mostrando {petsFiltradas.length} de {pets.length} mascotas
            </p>
          )}
        </section>
      </div>

      {/* Modal detalle */}
      <AnimatePresence>
        {selectedPet && (
          <DetailModal
            pet={selectedPet}
            citas={citas}
            loadingCitas={loadingCitas}
            onClose={() => setSelectedPet(null)}
          />
        )}
      </AnimatePresence>

      {/* Modal nueva mascota */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 12 }}
              transition={{ type: "spring", bounce: 0.18, duration: 0.38 }}
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nueva mascota</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <form id="form-mascota" onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Nombre *
                      </label>
                      <input
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        placeholder="Nombre de la mascota"
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Especie
                      </label>
                      <select
                        name="especie"
                        value={form.especie}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        <option value="Canino">Canino</option>
                        <option value="Felino">Felino</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Raza
                      </label>
                      <input
                        name="raza"
                        value={form.raza}
                        onChange={handleChange}
                        placeholder="Raza"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Sexo
                      </label>
                      <select
                        name="sexo"
                        value={form.sexo}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        <option value="Macho">Macho</option>
                        <option value="Hembra">Hembra</option>
                        <option value="No especificado">No especificado</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Edad (años)
                      </label>
                      <input
                        name="edad"
                        value={form.edad}
                        onChange={handleChange}
                        placeholder="Ej: 3 años"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Peso (kg)
                      </label>
                      <input
                        name="peso"
                        value={form.peso}
                        onChange={handleChange}
                        placeholder="Ej: 4.5 kg"
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Propietario *
                      </label>
                      <select
                        name="propietarioId"
                        value={form.propietarioId}
                        onChange={handleChange}
                        className={inputClass}
                        required
                      >
                        <option value="">Seleccionar propietario</option>
                        {propietarios.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — {p.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {formError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                      {formError}
                    </div>
                  )}
                </form>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  form="form-mascota"
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                >
                  {saving ? "Guardando..." : "Registrar mascota"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
