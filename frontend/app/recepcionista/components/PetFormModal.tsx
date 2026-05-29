"use client";

import { useEffect, useState } from "react";
import { Camera, CheckCircle2, X } from "lucide-react";
import type { Owner, PetRecord } from "../../../lib/recepcionista/types";

interface PetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pet: PetRecord) => void;
  owners: Owner[];
  initialPet?: PetRecord;
}

const initialState = {
  nombre: "",
  especie: "",
  raza: "",
  edad: "",
  peso: "",
  sexo: "No especificado" as PetRecord["sexo"],
  fechaNacimiento: "",
  foto: "",
  propietarioId: "",
};

export default function PetFormModal({
  isOpen,
  onClose,
  onSave,
  owners,
  initialPet,
}: PetFormModalProps) {
  const [formState, setFormState] = useState(initialState);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialPet) {
      setFormState({
        nombre: initialPet.nombre,
        especie: initialPet.especie,
        raza: initialPet.raza,
        edad: initialPet.edad,
        peso: initialPet.peso,
        sexo: initialPet.sexo,
        fechaNacimiento: initialPet.fechaNacimiento ?? "",
        foto: initialPet.foto ?? "",
        propietarioId: initialPet.propietarioId,
      });
      setError("");
      return;
    }

    setFormState(initialState);
    setError("");
  }, [initialPet, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formState.nombre.trim() || !formState.propietarioId) {
      setError("Nombre, especie y propietario son obligatorios.");
      return;
    }

    const owner = owners.find((item) => item.id === formState.propietarioId);

    if (!owner) {
      setError("Selecciona un propietario válido.");
      return;
    }

    const pet: PetRecord = {
      id: initialPet?.id ?? `p-${Date.now()}`,
      nombre: formState.nombre.trim(),
      especie: formState.especie.trim(),
      raza: formState.raza.trim(),
      edad: formState.edad.trim(),
      peso: formState.peso.trim(),
      sexo: formState.sexo,
      fechaNacimiento: formState.fechaNacimiento || undefined,
      foto: formState.foto.trim(),
      propietarioId: owner.id,
      propietarioNombre: owner.name,
    };

    onSave(pet);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <div className="w-full max-w-3xl rounded-[32px] bg-white p-6 shadow-2xl dark:bg-slate-950">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              {initialPet ? "Editar mascota" : "Registrar mascota"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              {initialPet ? "Actualizar ficha" : "Nueva ficha"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            Nombre
            <input
              value={formState.nombre}
              onChange={(event) => handleChange("nombre", event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              placeholder="Milo"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            Especie
            <input
              value={formState.especie}
              onChange={(event) => handleChange("especie", event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              placeholder="Perro"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            Raza
            <input
              value={formState.raza}
              onChange={(event) => handleChange("raza", event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              placeholder="Beagle"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            Peso
            <input
              value={formState.peso}
              onChange={(event) => handleChange("peso", event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              placeholder="12 kg"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            Edad
            <input
              value={formState.edad}
              onChange={(event) => handleChange("edad", event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              placeholder="4 años"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            Sexo
            <select
              value={formState.sexo}
              onChange={(event) => handleChange("sexo", event.target.value)}
              className="h-[46px] w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="No especificado">No especificado</option>
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            Fecha de nacimiento
            <input
              type="date"
              value={formState.fechaNacimiento}
              onChange={(event) => handleChange("fechaNacimiento", event.target.value)}
              className="h-[46px] w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200 sm:col-span-2">
            Foto (URL)
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
              <Camera className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              <input
                value={formState.foto}
                onChange={(event) => handleChange("foto", event.target.value)}
                placeholder="https://..."
                className="w-full bg-transparent text-sm text-[#10213A] outline-none placeholder:text-[#94A3B8] dark:text-white"
              />
            </div>
          </label>

          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200 sm:col-span-2">
            Propietario
            <select
              value={formState.propietarioId}
              onChange={(event) => handleChange("propietarioId", event.target.value)}
              className="h-[46px] w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">Selecciona un propietario</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? (
          <div className="mt-4 rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            Guardar mascota
          </button>
        </div>
      </div>
    </div>
  );
}
