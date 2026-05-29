"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { getInventoryItems } from "../../../lib/recepcionista/storage";
import type { InventoryItem } from "../../../lib/recepcionista/types";

export default function RecepcionistaInventarioPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    setInventory(getInventoryItems());
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Inventario</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Stock</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Consulta las existencias y los servicios disponibles.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {inventory.map((item) => (
            <div key={item.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.category}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {item.status}
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{item.available}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Unidades disponibles</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
