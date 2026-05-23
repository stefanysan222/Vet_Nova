import React from "react";

const VetPanel: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Panel veterinario</h2>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Nueva cita
          </button>
          <button className="border border-green-500 text-green-500 px-4 py-2 rounded-lg hover:bg-green-50 transition">
            Registro paciente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-gray-500 text-sm">Próxima cita</p>
          <p className="font-medium">Luna - Consulta general</p>
          <p className="text-gray-400 text-sm mt-1">En 15 minutos</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl">
          <p className="text-gray-500 text-sm">Alertas del día</p>
          <p className="font-medium">2 vacunas pendientes</p>
          <p className="text-gray-400 text-sm mt-1">Recordatorios enviados</p>
        </div>
      </div>
    </div>
  );
};

export default VetPanel;