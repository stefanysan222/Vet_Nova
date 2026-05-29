"use client";

import { useEffect, useState } from "react";
import { PawPrint, PlusCircle } from "lucide-react";
import PetFormModal from "../components/PetFormModal";
import { addPet, getOwners, getPets, updatePet } from "../../../lib/recepcionista/storage";
import type { Owner, PetRecord } from "../../../lib/recepcionista/types";

export default function RecepcionistaMascotasPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [pets, setPets] = useState<PetRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<PetRecord | undefined>(undefined);

  useEffect(() => {
    setOwners(getOwners());
    setPets(getPets());
  }, []);

  const handleSavePet = (pet: PetRecord) => {
    const exists = pets.some((item) => item.id === pet.id);
    if (exists) {
      updatePet(pet);
    } else {
      addPet(pet);
    }
    setPets(getPets());
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Mascotas</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Fichas de mascotas</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Registra nuevas mascotas y revisa sus fichas activas.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <PlusCircle className="h-5 w-5" />
            Nueva mascota
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pets.map((pet) => (
            <div key={pet.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-3xl bg-slate-200 dark:bg-slate-800">
                  {pet.foto ? (
                    <img src={pet.foto} alt={pet.nombre} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-500">Sin foto</div>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{pet.nombre}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{pet.especie} · {pet.raza}</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                <p>Propietario: {pet.propietarioNombre}</p>
                <p className="mt-2">Edad: {pet.edad}</p>
                <p>Peso: {pet.peso}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPet(pet);
                  setIsModalOpen(true);
                }}
                className="mt-4 inline-flex rounded-full border border-blue-600 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                Editar ficha
              </button>
            </div>
          ))}
        </div>
      </section>

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
