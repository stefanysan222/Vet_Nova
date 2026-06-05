// frontend/app/admin/usuarios/components/UsuarioCard.tsx
"use client";

import { useState } from "react";
import type { Usuario } from "../../types";

interface UsuarioCardProps {
  usuario: Usuario;
  onToggleStatus: (id: string) => void;
  onChangeRole: (id: string) => void;
  onEdit: (usuario: Usuario) => void;
}

export default function UsuarioCard({ usuario, onToggleStatus, onChangeRole, onEdit }: UsuarioCardProps) {
  // Filtrar solo roles válidos
  const rolesValidos = ["Cliente", "Veterinario"];
  if (!rolesValidos.includes(usuario.cargo)) return null;

  const [showDetails, setShowDetails] = useState(false);

  return (
    <article className="rounded-xl border border-slate-700/30 bg-slate-900 p-4 shadow-md transition hover:shadow-lg">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg text-white">{usuario.cargo}</h3>
        <button
          className="text-sm text-brand-400 hover:underline"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Ocultar detalles" : "Ver detalles"}
        </button>
      </div>

      {showDetails && (
        <div className="mt-3 space-y-2">
          <p className="text-white font-semibold">{usuario.nombre}</p>
          <p className="text-gray-300">{usuario.email}</p>
          <p className="text-gray-300">{usuario.telefono}</p>
          <p
            className={`inline-block px-2 py-1 rounded-full text-sm font-semibold ${
              usuario.estado === "Activo"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {usuario.estado}
          </p>

          <div className="mt-2 flex gap-2 flex-wrap">
            <button
              onClick={() => onEdit(usuario)}
              className="rounded-lg px-3 py-1 text-sm bg-slate-700 text-white hover:bg-slate-600"
            >
              Editar
            </button>
            <button
              onClick={() => onToggleStatus(usuario.id)}
              className="rounded-lg px-3 py-1 text-sm bg-brand-600 text-white hover:bg-brand-500"
            >
              {usuario.estado === "Activo" ? "Inactivar" : "Activar"}
            </button>
            <button
              onClick={() => onChangeRole(usuario.id)}
              className="rounded-lg px-3 py-1 text-sm bg-slate-700 text-white hover:bg-slate-600"
            >
              Cambiar rol
            </button>
          </div>
        </div>
      )}
    </article>
  );
}