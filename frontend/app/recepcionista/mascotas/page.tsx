"use client";

import { useEffect, useMemo, useState } from "react";
import { PawPrint, PlusCircle, UserRound, Search, Loader2 } from "lucide-react";
import PetFormModal from "../components/PetFormModal";
import { getPets, getOwners, addPet, updatePet } from "../../../lib/recepcionista/storage";
import type { Owner, PetRecord } from "../../../lib/recepcionista/types";

const cardHover = "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-200";
const buttonHover = "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]";

export default function RecepcionistaMascotasPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [pets, setPets] = useState<PetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<PetRecord | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState<"Todas" | string>("Todas");

  async function loadData() {
    setLoading(true);
    try {
      const [o, p] = await Promise.all([getOwners(), getPets()]);
      setOwners(o);
      setPets(p);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePet = async (pet: PetRecord) => {
    try {
      setSaveError(null);
      const exists = pets.some((item) => item.id === pet.id);
      if (exists) {
        await updatePet(pet);
      } else {
        await addPet({
          nombre: pet.nombre,
          especie: pet.especie,
          raza: pet.raza,
          edad: pet.edad,
          peso: pet.peso,
          sexo: pet.sexo,
          fechaNacimiento: pet.fechaNacimiento,
          foto: pet.foto,
          propietarioId: pet.propietarioId,
        });
      }
      const updated = await getPets();
      setPets(updated);
      setIsModalOpen(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar. Verifica que el servidor esté activo.");
    }
  };

  const filteredPets = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    return pets.filter((pet) => {
      const matchesSearch =
        pet.nombre.toLowerCase().includes(normalizedSearch) ||
        pet.raza.toLowerCase().includes(normalizedSearch) ||
        pet.propietarioNombre.toLowerCase().includes(normalizedSearch);
      const matchesSpecies = speciesFilter === "Todas" || pet.especie === speciesFilter;
      return matchesSearch && matchesSpecies;
    });
  }, [pets, searchTerm, speciesFilter]);

  const speciesOptions = useMemo(() => {
    const uniqueSpecies = Array.from(new Set(pets.map((p) => p.especie)));
    return ["Todas", ...uniqueSpecies];
  }, [pets]);

  const totalPets = pets.length;
  const uniqueOwners = useMemo(() => new Set(pets.map((p) => p.propietarioNombre)).size, [pets]);

  return (
    <div className="space-y-6">
      {saveError && (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          {saveError}
        </div>
      )}
      <section className="group relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Mascotas</p>
            <h1 className="mt-1 text-3xl font-black text-[#1e293b] dark:text-white">Fichas de mascotas</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#64748b] dark:text-slate-400">
              Registra nuevas mascotas y revisa sus fichas activas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={`inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white ${buttonHover}`}
          >
            <PlusCircle className="h-5 w-5" />
            Nueva mascota
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className={`group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm ${cardHover}`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total mascotas</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
              <PawPrint className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{loading ? "—" : totalPets}</p>
        </article>

        <article className={`group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm ${cardHover}`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Propietarios únicos</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <UserRound className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{loading ? "—" : uniqueOwners}</p>
        </article>
      </section>

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 w-full sm:max-w-md">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, raza o propietario..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
          className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          {speciesOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filteredPets.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center">
          <PawPrint className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 text-sm font-semibold text-slate-900">No hay mascotas registradas</p>
          <p className="mt-2 text-sm text-slate-500">Registra la primera mascota usando el botón de arriba.</p>
        </div>
      ) : (
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPets.map((pet) => (
            <div
              key={pet.id}
              className={`group relative rounded-[24px] border border-slate-200 bg-slate-50 p-5 shadow-sm ${cardHover}`}
            >
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-3xl bg-slate-200 transition-transform duration-300 group-hover:scale-105">
                  {pet.foto ? (
                    <img src={pet.foto} alt={pet.nombre} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-500 text-xs">Sin foto</div>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{pet.nombre}</h2>
                  <p className="text-sm text-slate-500">{pet.especie} · {pet.raza}</p>
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-500 space-y-1">
                <p>Propietario: {pet.propietarioNombre || "—"}</p>
                <p>Edad: {pet.edad || "—"}</p>
                <p>Peso: {pet.peso || "—"}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedPet(pet);
                  setIsModalOpen(true);
                }}
                className={`mt-4 inline-flex items-center gap-2 rounded-full border border-blue-600 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 ${buttonHover}`}
              >
                <PlusCircle className="h-4 w-4 text-blue-700" />
                Editar ficha
              </button>
            </div>
          ))}
        </section>
      )}

      <PetFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPet(undefined);
        }}
        onSave={handleSavePet}
        owners={owners}
        initialPet={selectedPet}
      />
    </div>
  );
}
