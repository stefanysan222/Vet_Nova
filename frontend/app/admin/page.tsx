"use client";

import React, { useState } from "react";
import Sidebar from "../components/admin/Sidebar";
import Navbar from "../components/admin/Navbar";
import StatsCards from "../components/admin/StatsCards";
import ReportsCharts from "../components/admin/ReportsCharts";
import NotificationsPanel from "../components/admin/NotificationsPanel";
import RegisterUserModal from "../components/admin/RegisterUserModal";
import { motion } from "framer-motion";

const AdminDashboardPage: React.FC = () => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <div className="flex-1 px-6 py-8">
          {/* Banner de Bienvenida */}
          <motion.div
            className="mb-8 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-sky-500 p-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.16)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-100/80">
                  Panel Administrativo
                </p>
                <h1 className="text-4xl font-semibold tracking-tight">
                  Bienvenido, Administrador
                </h1>
                <p className="max-w-2xl text-base leading-7 text-blue-100/90">
                  Gestiona y supervisa toda la operación de VetNova desde un solo lugar con herramientas de control, agilidad y transparencia.
                </p>
              </div>
              <button 
                onClick={() => setIsRegisterModalOpen(true)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-2xl bg-white px-7 py-4 text-sm font-semibold text-blue-700 shadow-lg shadow-slate-900/10 transition duration-300 hover:bg-blue-50"
              >
                + Registrar Usuario
              </button>
            </div>
          </motion.div>

          {/* Tarjetas de estadísticas */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StatsCards />
          </motion.div>

          {/* Charts and Notifications Grid */}
          <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
            {/* Charts Area */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ReportsCharts />
            </motion.div>

            {/* Right Sidebar - Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <NotificationsPanel />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Register User Modal */}
      <RegisterUserModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} />
    </div>
  );
};

export default AdminDashboardPage;