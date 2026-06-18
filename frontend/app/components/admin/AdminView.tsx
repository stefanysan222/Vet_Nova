// frontend/app/components/admin/AdminView.tsx
import React from "react";
import Sidebar from "./Sidebar"; // Correcta importación desde la misma carpeta
import Navbar from "./Navbar"; // Correcta importación desde la misma carpeta
import StatsCards from "./StatsCards"; // Correcta importación desde la misma carpeta
import ReportsCharts from "./ReportsCharts"; // Correcta importación desde la misma carpeta
import NotificationsPanel from "./NotificationsPanel"; // Correcta importación desde la misma carpeta

const AdminView: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex flex-1 flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Banner de bienvenida */}
        <div className="m-6 flex items-center justify-between rounded-2xl bg-brand-50 p-6 shadow">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Bienvenido, Administrador</h1>
            <p className="mt-1 text-gray-500">
              Supervisa y gestiona toda la operación de VetNova desde un solo lugar.
            </p>
          </div>
          <button className="rounded-lg bg-brand-600 px-5 py-2 text-white hover:bg-brand-700">
            Registrar nuevo usuario
          </button>
        </div>

        {/* Contenido */}
        <div className="mx-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Tarjetas de estadísticas */}
          <StatsCards />
        </div>

        {/* Gráficos */}
        <div className="mx-6 mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="lg:col-span-1">
            <ReportsCharts />
          </div>

          {/* Notificaciones */}
          <div className="lg:col-span-1">
            <NotificationsPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
