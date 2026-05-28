import React from "react";

const VetPanel: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow dark:bg-slate-950 dark:border dark:border-slate-700 dark:shadow-slate-900/40">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Panel veterinario</h2>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Nueva cita
          </button>
          <button className="border border-green-500 text-green-500 px-4 py-2 rounded-lg hover:bg-green-50 transition dark:hover:bg-green-900/40">
            Registro paciente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-blue-50 p-4 rounded-xl dark:bg-blue-900/40">
          <p className="text-slate-500 text-sm dark:text-slate-300">Próxima cita</p>
          <p className="font-medium text-slate-900 dark:text-white">Luna - Consulta general</p>
          <p className="text-slate-400 text-sm mt-1 dark:text-slate-400">En 15 minutos</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl dark:bg-emerald-900/30">
          <p className="text-slate-500 text-sm dark:text-slate-300">Alertas del día</p>
          <p className="font-medium text-slate-900 dark:text-white">2 vacunas pendientes</p>
          <p className="text-slate-400 text-sm mt-1 dark:text-slate-400">Recordatorios enviados</p>
        </div>
      </div>
    </div>
  );
};

export default VetPanel;