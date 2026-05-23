"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    name: string;
    email: string;
    role: string;
    phone?: string;
    specialty?: string;
  } | null;
}

export default function EditUserModal({ isOpen, onClose, user }: EditUserModalProps) {
  const [form, setForm] = useState({ name: "", email: "", role: "", phone: "", specialty: "" });

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email, role: user.role, phone: user.phone ?? "", specialty: user.specialty ?? "" });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Update user (stub):", form);
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
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Editar usuario</h3>
                <p className="text-sm text-slate-500">Modifica la información del usuario. Los cambios se guardarán en la base de datos cuando esté conectada.</p>
              </div>
              <button onClick={onClose} type="button" className="rounded-full p-2 hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Nombre completo</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-md border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Correo</label>
                <input name="email" value={form.email} onChange={handleChange} className="w-full rounded-md border px-3 py-2" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Teléfono</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-md border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Rol</label>
                <select name="role" value={form.role} onChange={handleChange} className="w-full rounded-md border px-3 py-2">
                  <option value="Recepcionista">Recepcionista</option>
                  <option value="Veterinario">Veterinario</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
            </div>

            {form.role.toLowerCase().includes("veterin") && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Especialidad</label>
                <input name="specialty" value={form.specialty} onChange={handleChange} className="w-full rounded-md border px-3 py-2" />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="rounded-2xl border px-4 py-2">Cancelar</button>
              <button type="submit" className="rounded-2xl bg-blue-600 px-4 py-2 text-white">Guardar cambios</button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
