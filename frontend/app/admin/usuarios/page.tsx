"use client";

import { useState } from "react";
import StatsCards from "../../components/admin/StatsCards";
import UsersTable from "../../components/admin/UsersTable";
import RegisterUserModal from "../../components/admin/RegisterUserModal";

export default function UsuariosPage() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreated = () => setRefreshTrigger((k) => k + 1);

  return (
    <div className="admin-page">
      {/* Header */}
      <section className="admin-card-padded">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-1">
            <p className="text-eyebrow">Usuarios</p>
            <h1 className="text-page-title">Gestión de Usuarios</h1>
            <p className="text-subtitle max-w-2xl">
              Registra y administra los veterinarios y clientes de VetNova.
            </p>
          </div>
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="btn-primary"
          >
            + Nuevo Usuario
          </button>
        </div>
      </section>

      <div className="mt-6 space-y-6">
        <StatsCards refreshTrigger={refreshTrigger} />
        <UsersTable refreshTrigger={refreshTrigger} />
      </div>

      <RegisterUserModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
