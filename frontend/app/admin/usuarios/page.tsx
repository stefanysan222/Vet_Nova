"use client";

import { useState } from "react";
import Navbar from "../../components/admin/Navbar";
import Sidebar from "../../components/admin/Sidebar";
import StatsCards from "../../components/admin/StatsCards";
import UsersTable from "../../components/admin/UsersTable";
import RegisterUserModal from "../../components/admin/RegisterUserModal";

export default function UsuariosPage() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar />

        <div className="lg:order-2">
          <Navbar />

          <main className="mx-auto max-w-7xl px-5 pb-12 pt-6 sm:px-6 lg:px-10">
            <section className="rounded-[2rem] border border-slate-200/60 bg-white/95 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/60">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Panel administrativo</p>
                  <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Gestión de Usuarios</h1>
                  <p className="max-w-2xl text-base leading-7 text-slate-600">
                    Administra al equipo de VetNova con una interfaz limpia, moderna y altamente responsive.
                  </p>
                </div>
                <button 
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(37,99,235,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  + Nuevo Usuario
                </button>
              </div>
            </section>

            <div className="mt-6 space-y-6">
              <StatsCards />
              <UsersTable />
            </div>
          </main>

          {/* Register User Modal */}
          <RegisterUserModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} />
        </div>
      </div>
    </div>
  );
}