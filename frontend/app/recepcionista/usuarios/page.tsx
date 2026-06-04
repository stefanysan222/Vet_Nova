"use client";

import { useEffect, useState } from "react";
import { Loader2, PlusCircle } from "lucide-react";
import OwnerFormModal from "../components/OwnerFormModal";
import { getOwners, addOwner, saveOwner } from "../../../lib/recepcionista/storage";
import type { Owner } from "../../../lib/recepcionista/types";

export default function RecepcionistaUsuariosPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | undefined>(undefined);

  async function loadOwners() {
    setLoading(true);
    try {
      const data = await getOwners();
      setOwners(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOwners();
  }, []);

  const handleSaveOwner = async (owner: Owner) => {
    try {
      const exists = owner.id && owners.some((item) => item.id === owner.id);
      if (exists) {
        await saveOwner(owner);
      } else {
        await addOwner({
          name: owner.name,
          email: owner.email,
          phone: owner.phone,
          address: owner.address,
          documento: owner.documento,
          estado: owner.estado,
        });
      }
      await loadOwners();
      setIsModalOpen(false);
      setSelectedOwner(undefined);
    } catch (err) {
      console.error("Error guardando propietario:", err);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Usuarios</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Propietarios</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Registra y actualiza los propietarios en recepción.</p>
          </div>
          <button
            type="button"
            onClick={() => { setSelectedOwner(undefined); setIsModalOpen(true); }}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <PlusCircle className="h-5 w-5" />
            Nuevo propietario
          </button>
        </div>

        {loading ? (
          <div className="mt-6 flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : owners.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm font-semibold text-slate-900">No hay propietarios registrados</p>
            <p className="mt-2 text-sm text-slate-500">Registra el primero usando el botón de arriba.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {owners.map((owner) => (
              <div key={owner.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{owner.name}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{owner.email || "Sin correo"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedOwner(owner); setIsModalOpen(true); }}
                    className="rounded-full border border-blue-600 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    Editar
                  </button>
                </div>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Teléfono: {owner.phone || "—"}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Dirección: {owner.address || "—"}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <OwnerFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedOwner(undefined); }}
        onSave={handleSaveOwner}
        initialOwner={selectedOwner}
      />
    </div>
  );
}
