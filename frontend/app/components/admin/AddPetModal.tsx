"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface PetRecord {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  edad: string;
  peso: string;
  propietario: string;
  foto?: string;
}

interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pet: PetRecord) => void;
  initialPet?: PetRecord;
}

const emptyPet: Omit<PetRecord, "id"> = {
  nombre: "",
  especie: "",
  raza: "",
  edad: "",
  peso: "",
  propietario: "",
  foto: "",
};

export default function AddPetModal({ isOpen, onClose, onSave, initialPet }: AddPetModalProps) {
  const [pet, setPet] = useState<PetRecord>({ id: "", ...emptyPet });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const isEditing = Boolean(initialPet?.id);

  useEffect(() => {
    if (!isOpen) {
      setPet({ id: "", ...emptyPet });
      setErrors({});
      setPhotoError(null);
      setPhotoLoading(false);
      return;
    }

    if (initialPet) {
      setPet(initialPet);
      setErrors({});
      setPhotoError(null);
      setPhotoLoading(false);
    } else {
      setPet({ id: "", ...emptyPet });
      setErrors({});
      setPhotoError(null);
      setPhotoLoading(false);
    }
  }, [initialPet, isOpen]);

  const handleChange = (field: keyof Omit<PetRecord, "id">, value: string) => {
    setPet((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handlePhotoChange = (file: File | null) => {
    if (!file) {
      setPet((current) => ({ ...current, foto: "" }));
      setPhotoError(null);
      setPhotoLoading(false);
      return;
    }

    setPhotoLoading(true);
    setPhotoError(null);

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setPet((current) => ({ ...current, foto: String(reader.result) }));
      }
      setPhotoLoading(false);
    };
    reader.onerror = () => {
      setPhotoError("No se pudo procesar la imagen. Intenta con otro archivo.");
      setPhotoLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!pet.nombre.trim()) nextErrors.nombre = "El nombre es obligatorio.";
    if (!pet.especie.trim()) nextErrors.especie = "La especie es obligatoria.";
    if (!pet.raza.trim()) nextErrors.raza = "La raza es obligatoria.";
    if (!pet.edad.trim()) nextErrors.edad = "La edad es obligatoria.";
    if (!pet.peso.trim()) nextErrors.peso = "El peso es obligatorio.";

    return nextErrors;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      ...pet,
      id: pet.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.form
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", bounce: 0, duration: 0.25 }}
            onSubmit={handleSubmit}
            className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">{isEditing ? "Editar mascota" : "Agregar mascota"}</h2>
                <p className="mt-1 text-sm text-slate-500">{isEditing ? "Actualiza los datos o cambia la foto de la mascota." : "Completa los datos requeridos para registrar la mascota."}</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Nombre</span>
                <input
                  value={pet.nombre}
                  onChange={(event) => handleChange("nombre", event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                {errors.nombre ? <p className="text-sm text-rose-600">{errors.nombre}</p> : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Foto de mascota</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handlePhotoChange(event.target.files?.[0] ?? null)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none file:cursor-pointer file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white file:transition file:hover:bg-blue-700"
                />
                {photoLoading ? (
                  <p className="mt-3 text-sm text-slate-500">Cargando imagen...</p>
                ) : null}
                {photoError ? <p className="mt-3 text-sm text-rose-600">{photoError}</p> : null}
                {pet.foto ? (
                  <div className="space-y-3">
                    <img
                      src={pet.foto}
                      alt="Vista previa de mascota"
                      className="mt-3 h-28 w-full rounded-3xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handlePhotoChange(null)}
                      className="rounded-3xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Eliminar foto
                    </button>
                  </div>
                ) : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Especie</span>
                <input
                  value={pet.especie}
                  onChange={(event) => handleChange("especie", event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                {errors.especie ? <p className="text-sm text-rose-600">{errors.especie}</p> : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Raza</span>
                <input
                  value={pet.raza}
                  onChange={(event) => handleChange("raza", event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                {errors.raza ? <p className="text-sm text-rose-600">{errors.raza}</p> : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Edad</span>
                <input
                  value={pet.edad}
                  onChange={(event) => handleChange("edad", event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Ej: 3 años"
                />
                {errors.edad ? <p className="text-sm text-rose-600">{errors.edad}</p> : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Peso</span>
                <input
                  value={pet.peso}
                  onChange={(event) => handleChange("peso", event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Ej: 8.5 kg"
                />
                {errors.peso ? <p className="text-sm text-rose-600">{errors.peso}</p> : null}
              </label>
            </div>

            <label className="mt-4 space-y-2">
              <span className="text-sm font-semibold text-slate-700">Propietario</span>
              <input
                value={pet.propietario}
                onChange={(event) => handleChange("propietario", event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Nombre del propietario"
              />
            </label>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-3xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={photoLoading}
                className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {photoLoading ? "Procesando imagen..." : isEditing ? "Guardar cambios" : "Guardar mascota"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
