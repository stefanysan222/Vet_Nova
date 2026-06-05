// frontend/app/components/admin/AdminView.tsx
import React from "react";
import Sidebar from "./Sidebar";  // Correcta importación desde la misma carpeta
import Navbar from "./Navbar";  // Correcta importación desde la misma carpeta
import StatsCards from "./StatsCards";  // Correcta importación desde la misma carpeta
import ReportsCharts from "./ReportsCharts";  // Correcta importación desde la misma carpeta
import NotificationsPanel from "./NotificationsPanel";  // Correcta importación desde la misma carpeta

const AdminView: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Banner de bienvenida */}
        <div className="m-6 bg-brand-50 p-6 rounded-2xl flex justify-between items-center shadow">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Bienvenido, Administrador</h1>
            <p className="text-gray-500 mt-1">
              Supervisa y gestiona toda la operación de VetNova desde un solo lugar.
            </p>
          </div>
          <button className="bg-brand-600 text-white px-5 py-2 rounded-lg hover:bg-brand-700">
            Registrar nuevo usuario
          </button>
        </div>

        {/* Contenido */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-6">
          {/* Tarjetas de estadísticas */}
          <StatsCards />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-6 mt-6">
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