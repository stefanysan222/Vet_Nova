"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import { fetchMascotas } from "../../../lib/api/mascotas";
import type { PetRecord } from "../../../lib/recepcionista/types";

export default function MascotasPage() {
  const [pets, setPets] = useState<PetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState<PetRecord | null>(null);

  useEffect(() => {
    fetchMascotas()
      .then(setPets)
      .catch(() => setPets([]))
      .finally(() => setLoading(false));
  }, []);

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
                    Vista general de todos los pacientes registrados en el sistema.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <article className="rounded-3xl border border-slate-200/70 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Mascotas activas</h2>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Registros en la base de datos.</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                    {loading ? "—" : pets.length}
                  </p>
                </article>
                <article className="rounded-3xl border border-slate-200/70 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Propietarios únicos</h2>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Clientes con mascotas registradas.</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                    {loading ? "—" : new Set(pets.map((p) => p.propietarioId).filter(Boolean)).size}
                  </p>
                </article>
              </div>

              <div className="mt-8 space-y-4">
                {loading ? (
                  <p className="text-sm text-slate-500">Cargando mascotas...</p>
                ) : pets.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-slate-600 dark:text-slate-400">No hay mascotas registradas en el sistema.</p>
                    <p className="mt-2 text-sm text-slate-500">Regístralas desde el módulo de Recepcionista.</p>
                  </div>
                ) : (
                  pets.map((pet) => (
                    <div key={pet.id} className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <div className="grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)]">
                        <div className="overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-950">
                          {pet.foto ? (
                            <img src={pet.foto} alt={pet.nombre} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full min-h-[120px] items-center justify-center text-sm text-slate-400">
                              Sin foto
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">{pet.especie}</p>
                            <button
                              onClick={() => setSelectedPet(pet)}
                              className="mt-2 text-2xl font-semibold text-slate-900 underline decoration-blue-500 underline-offset-4 transition hover:text-blue-600 dark:text-white"
                            >
                              {pet.nombre}
                            </button>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Raza: {pet.raza || "—"}</p>
                          </div>
                          <div className="space-y-2 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-950 dark:text-slate-200">
                            <p>Edad: {pet.edad || "—"}</p>
                            <p>Peso: {pet.peso || "—"}</p>
                            <p>Propietario: {pet.propietarioNombre || "No registrado"}</p>
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => setSelectedPet(pet)}
                              className="rounded-3xl border border-blue-600 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-200"
                            >
                              Ver detalle
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </main>
        </div>
      </div>

      {selectedPet ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-950" role="dialog" aria-modal="true">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">Detalle de mascota</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{selectedPet.nombre}</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Ficha completa</p>
              </div>
              <button
                onClick={() => setSelectedPet(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
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
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedPet.especie || "—"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">Raza</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedPet.raza || "—"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">Propietario</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedPet.propietarioNombre || "No registrado"}</p>
                </div>
              </div>

              <div className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-950">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Edad</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{selectedPet.edad || "—"}</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-950">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Peso</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{selectedPet.peso || "—"}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Historia clínica</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Registro de consultas, tratamientos y seguimiento médico.</p>
                  <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950">
                    Historial clínico en desarrollo — disponible próximamente.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
