"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getInventoryItems } from "../../../lib/recepcionista/storage";
import type { InventoryItem } from "../../../lib/recepcionista/types";

export default function RecepcionistaInventarioPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInventoryItems()
      .then(setInventory)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Inventario</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Stock</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Consulta las existencias disponibles.</p>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : inventory.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm font-semibold text-slate-900">No hay productos en el inventario</p>
            <p className="mt-2 text-sm text-slate-500">Los productos registrados en el sistema aparecerán aquí.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {inventory.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.category}</p>
                  </div>
                  <span className={[
                    "rounded-full px-3 py-1 text-sm font-semibold",
                    item.status === "Disponible"
                      ? "bg-green-100 text-green-700"
                      : item.status === "Stock bajo"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700",
                  ].join(" ")}>
                    {item.status}
                  </span>
                </div>
                <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{item.available}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Unidades disponibles</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
