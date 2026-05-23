"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export default function PermissionsModal({ isOpen, onClose, user }: PermissionsModalProps) {
  const permissions = [
    "Ver pacientes",
    "Crear/editar pacientes",
    "Ver citas",
    "Crear/editar citas",
    "Administrar usuarios",
    "Ver facturación",
    "Configurar integraciones",
  ];

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
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Permisos de {user?.name ?? "Usuario"}</h3>
                <p className="text-sm text-slate-500">Revisa y modifica los permisos asignados a este usuario.</p>
              </div>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <div className="mt-6 grid gap-3">
              {permissions.map((p) => (
                <label key={p} className="inline-flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3">
                  <input type="checkbox" className="h-4 w-4" defaultChecked={Math.random() > 0.5} />
                  <span className="text-sm text-slate-700">{p}</span>
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={onClose} className="rounded-2xl border px-4 py-2">Cancelar</button>
              <button className="rounded-2xl bg-blue-600 px-4 py-2 text-white">Guardar</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
