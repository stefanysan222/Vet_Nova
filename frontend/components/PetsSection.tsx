"use client";

import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";

const pets = [
  {
    id: 1,
    name: "Max",
    type: "Perro",
    age: "4 años",
    health: "Excelente",
    emoji: "🐕",
  },
  {
    id: 2,
    name: "Luna",
    type: "Gato",
    age: "2 años",
    health: "Buena",
    emoji: "🐈",
  },
  {
    id: 3,
    name: "Rocky",
    type: "Perro",
    age: "6 años",
    health: "Buena",
    emoji: "🐕",
  },
];

export default function PetsSection() {
  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Mis Mascotas</h2>
          <p className="text-sm text-slate-500">Gestiona el perfil de tus mascotas</p>
        </div>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
          + Agregar Mascota
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pets.map((pet, idx) => (
          <motion.div
            key={pet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 px-6 py-8 text-center">
              <div className="text-6xl">{pet.emoji}</div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900">{pet.name}</h3>
              <p className="text-sm text-slate-500">{pet.type}</p>

              <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Edad</span>
                  <span className="font-semibold text-slate-900">{pet.age}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Estado</span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-600">
                    <Heart size={14} className="text-emerald-500" /> {pet.health}
                  </span>
                </div>
              </div>

              <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 font-semibold text-blue-600 transition hover:bg-blue-100">
                Ver perfil <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
