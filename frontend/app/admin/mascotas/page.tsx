"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import AddPetModal, { PetRecord } from "../../components/admin/AddPetModal";

const SAMPLE_PETS: PetRecord[] = [
  {
    id: "pet-1",
    nombre: "Max",
    especie: "Perro",
    raza: "Labrador",
    edad: "4 años",
    peso: "25 kg",
    propietario: "Ana Pérez",
    foto: "",
  },
  {
    id: "pet-2",
    nombre: "Luna",
    especie: "Gato",
    raza: "Siames",
    edad: "2 años",
    peso: "4.3 kg",
    propietario: "Carlos Ruiz",
    foto: "",
  },
];

const MEDICAL_HISTORY: Record<string, string[]> = {
  Max: [
    "01/03/2026 - Vacunación anual y revisión general. Peso correcto.",
    "12/11/2025 - Limpieza dental y control de placa.",
    "24/07/2025 - Consulta por alergia en piel; tratamiento con shampoo medicado.",
  ],
  Luna: [
    "18/04/2026 - Vacunación antirrábica y desparasitación.",
    "02/01/2026 - Consulta por pérdida de apetito. Se prescribió dieta digestiva.",
  ],
};

export default function MascotasPage() {
  const [pets, setPets] = useState<PetRecord[]>([]);
  const [selectedPet, setSelectedPet] = useState<PetRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem("vetnova-admin-pets");
    if (raw) {
      setPets(JSON.parse(raw));
      return;
    }
    setPets(SAMPLE_PETS);
  }, []);

  const savePets = (nextPets: PetRecord[]) => {
    setPets(nextPets);
    window.localStorage.setItem("vetnova-admin-pets", JSON.stringify(nextPets));
  };

  const handleSavePet = (pet: PetRecord) => {
    const exists = pets.some((item) => item.id === pet.id);
    const nextPets = exists ? pets.map((item) => (item.id === pet.id ? pet : item)) : [pet, ...pets];
    savePets(nextPets);
  };

  const handleRemovePhoto = (petId: string) => {
    const nextPets = pets.map((item) =>
      item.id === petId ? { ...item, foto: "" } : item,
    );
    savePets(nextPets);

    if (selectedPet?.id === petId) {
      setSelectedPet({ ...selectedPet, foto: "" });
    }
  };

  const openEditPet = (pet: PetRecord) => {
    setSelectedPet(pet);
    setIsModalOpen(true);
  };

  const openPetDetails = (pet: PetRecord) => {
    setSelectedPet(pet);
  };

  const closePetDetails = () => {
    setSelectedPet(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar />
        <div className="lg:order-2">
          <Navbar />
          <main className="mx-auto max-w-7xl px-6 pb-12 pt-6 lg:px-10">
            <section className="rounded-[2rem] border border-slate-200/60 bg-white/95 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-950">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">Mascotas</p>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Registro de mascotas</h1>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
                    Completa los datos del paciente y almacena su información clínica de forma segura.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPet(null);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(37,99,235,0.22)] transition duration-300 hover:bg-blue-700"
                >
                  Agregar mascota
                </button>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <article className="rounded-3xl border border-slate-200/70 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Mascotas activas</h2>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Registros guardados y lista de pacientes actuales.</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{pets.length}</p>
                </article>
                <article className="rounded-3xl border border-slate-200/70 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Formulario de registro</h2>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Nombre, especie, raza, edad y peso son los campos requeridos.</p>
                </article>
              </div>

              <div className="mt-8 space-y-4">
                {pets.map((pet) => (
                  <div key={pet.id} className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)]">
                      <div className="overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-950">
                        {pet.foto ? (
                          <img src={pet.foto} alt={pet.nombre} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full min-h-[160px] items-center justify-center text-sm text-slate-400">
                            No hay foto
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">{pet.especie}</p>
                          <button onClick={() => openPetDetails(pet)} className="mt-2 text-2xl font-semibold text-slate-900 underline decoration-blue-500 underline-offset-4 transition hover:text-blue-600 dark:text-white">
                            {pet.nombre}
                          </button>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Raza: {pet.raza}</p>
                        </div>
                        <div className="space-y-2 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-950 dark:text-slate-200">
                          <p>Edad: {pet.edad}</p>
                          <p>Peso: {pet.peso}</p>
                          <p>Propietario: {pet.propietario || "No registrado"}</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => openEditPet(pet)}
                            className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                          >
                            Editar
                          </button>
                          {pet.foto ? (
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(pet.id)}
                              className="rounded-3xl border border-rose-600 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500 dark:bg-rose-950 dark:text-rose-200"
                            >
                              Eliminar foto
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => openPetDetails(pet)}
                            className="rounded-3xl border border-blue-600 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-200"
                          >
                            Ver detalle
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      <AddPetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(pet) => {
          handleSavePet(pet);
          setSelectedPet(pet);
        }}
        initialPet={selectedPet ?? undefined}
      />

      {selectedPet ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-950" role="dialog" aria-modal="true">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">Detalle de mascota</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{selectedPet.nombre}</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Historia clínica y ficha completa</p>
              </div>
              <button onClick={closePetDetails} className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                ×
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
              <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                {selectedPet.foto ? (
                  <img src={selectedPet.foto} alt={selectedPet.nombre} className="h-64 w-full rounded-3xl object-cover" />
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-3xl bg-slate-100 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                    Sin imagen disponible
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">Especie</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedPet.especie}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">Raza</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedPet.raza}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">Propietario</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedPet.propietario || "No registrado"}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => openEditPet(selectedPet)}
                    className="rounded-3xl border border-blue-600 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-200"
                  >
                    Actualizar foto
                  </button>
                  {selectedPet.foto ? (
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(selectedPet.id)}
                      className="rounded-3xl border border-rose-600 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500 dark:bg-rose-950 dark:text-rose-200"
                    >
                      Eliminar foto
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-950">
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Edad</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{selectedPet.edad}</p>
                    </div>
                    <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-950">
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Peso</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{selectedPet.peso}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(true);
                      closePetDetails();
                    }}
                    className="rounded-3xl border border-blue-600 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-200"
                  >
                    Editar mascota
                  </button>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Historia clínica</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Registro de consultas, tratamientos y seguimiento médico.</p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    {(MEDICAL_HISTORY[selectedPet.nombre] || ["Aún no hay historial registrado."]).map((item, index) => (
                      <li key={index} className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
