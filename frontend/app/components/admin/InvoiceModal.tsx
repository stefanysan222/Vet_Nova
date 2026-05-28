"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface InvoiceRecord {
  id: string;
  servicio: string;
  propietario: string;
  mascota: string;
  importe: string;
  fecha: string;
  estado: "Pagado" | "Pendiente";
}

interface InvoiceModalProps {
  isOpen: boolean;
  owners: string[];
  pets: string[];
  onClose: () => void;
  onSave: (invoice: InvoiceRecord) => void;
  initialInvoice?: InvoiceRecord;
}

const emptyInvoice: Omit<InvoiceRecord, "id"> = {
  servicio: "Consulta veterinaria",
  propietario: "",
  mascota: "",
  importe: "0",
  fecha: new Date().toISOString().split("T")[0],
  estado: "Pendiente",
};

export default function InvoiceModal({ isOpen, owners, pets, onClose, onSave, initialInvoice }: InvoiceModalProps) {
  const [invoice, setInvoice] = useState<InvoiceRecord>({ id: "", ...emptyInvoice });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      setInvoice({ id: "", ...emptyInvoice });
      setErrors({});
      return;
    }

    if (initialInvoice) {
      setInvoice(initialInvoice);
    } else {
      setInvoice({ id: "", ...emptyInvoice });
    }
    setErrors({});
  }, [initialInvoice, isOpen]);

  const handleChange = (field: keyof Omit<InvoiceRecord, "id">, value: string) => {
    setInvoice((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!invoice.servicio.trim()) nextErrors.servicio = "Describe el servicio.";
    if (!invoice.propietario.trim()) nextErrors.propietario = "Selecciona el propietario.";
    if (!invoice.mascota.trim()) nextErrors.mascota = "Selecciona la mascota.";
    if (!invoice.importe.trim() || Number(invoice.importe) <= 0) nextErrors.importe = "Ingresa un importe válido.";

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
      ...invoice,
      id: invoice.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
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
            className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Registrar factura</h2>
                <p className="mt-1 text-sm text-slate-500">Asocia la factura a propietario y mascota.</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Servicio</span>
                <input
                  value={invoice.servicio}
                  onChange={(event) => handleChange("servicio", event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                {errors.servicio ? <p className="text-sm text-rose-600">{errors.servicio}</p> : null}
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Propietario</span>
                <select
                  value={invoice.propietario}
                  onChange={(event) => handleChange("propietario", event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Selecciona propietario</option>
                  {owners.map((owner) => (
                    <option key={owner} value={owner}>{owner}</option>
                  ))}
                </select>
                {errors.propietario ? <p className="text-sm text-rose-600">{errors.propietario}</p> : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Mascota</span>
                <select
                  value={invoice.mascota}
                  onChange={(event) => handleChange("mascota", event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Selecciona mascota</option>
                  {pets.map((pet) => (
                    <option key={pet} value={pet}>{pet}</option>
                  ))}
                </select>
                {errors.mascota ? <p className="text-sm text-rose-600">{errors.mascota}</p> : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Importe</span>
                <input
                  type="number"
                  min="0"
                  value={invoice.importe}
                  onChange={(event) => handleChange("importe", event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                {errors.importe ? <p className="text-sm text-rose-600">{errors.importe}</p> : null}
              </label>
            </div>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Fecha</span>
                <input
                  type="date"
                  value={invoice.fecha}
                  onChange={(event) => handleChange("fecha", event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Estado</span>
                <select
                  value={invoice.estado}
                  onChange={(event) => handleChange("estado", event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Pagado">Pagado</option>
                </select>
              </label>
            </div>

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
                className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700"
              >
                Guardar factura
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
