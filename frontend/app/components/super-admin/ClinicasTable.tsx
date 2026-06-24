"use client";

import { Building2, Copy, Mail, MapPin, Phone } from "lucide-react";
import { StatusBadge } from "../../../lib/utils/status-badge";
import { SkeletonCardList } from "../ui/Skeleton";
import type { Clinica } from "../../../lib/api/clinicas";

interface ClinicasTableProps {
  clinicas: Clinica[];
  loading: boolean;
  onRowClick: (clinica: Clinica) => void;
  onCopyLink: (slug: string, nombre: string) => void;
  onEditCoords: (clinica: Clinica) => void;
  onToggleEstado: (clinica: Clinica) => void;
}

/**
 * Tabla de clínicas usada por el dashboard de Super-Admin (app/super-admin/page.tsx).
 */
export default function ClinicasTable({
  clinicas,
  loading,
  onRowClick,
  onCopyLink,
  onEditCoords,
  onToggleEstado,
}: ClinicasTableProps) {
  if (loading) {
    return <SkeletonCardList count={4} />;
  }

  if (clinicas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 py-14 text-center dark:border-slate-700 dark:bg-slate-800/40">
        <Building2 className="h-10 w-10 text-slate-300 dark:text-slate-600" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Todavía no hay clínicas registradas.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/70 dark:border-slate-700">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200/70 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Clínica
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Contacto
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Registrada
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Estado
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {clinicas.map((c) => (
            <tr
              key={c.id}
              id={`clinica-row-${c.id}`}
              onClick={() => onRowClick(c)}
              className="cursor-pointer bg-white transition hover:bg-slate-50 dark:bg-transparent dark:hover:bg-slate-800/40"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">{c.nombre}</p>
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-xs text-slate-400">/register?clinica={c.slug}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyLink(c.slug, c.nombre);
                        }}
                        className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800 dark:hover:text-brand-400"
                        aria-label="Copiar enlace de registro"
                        title="Copiar enlace de registro"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                  {c.direccion && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" /> {c.direccion}
                    </span>
                  )}
                  {c.telefono && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3 shrink-0" /> {c.telefono}
                    </span>
                  )}
                  {c.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3 shrink-0" /> {c.email}
                    </span>
                  )}
                  {!c.direccion && !c.telefono && !c.email && <span>—</span>}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                {c.createdAt
                  ? new Date(c.createdAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={c.estado === "activa" ? "Activa" : "Inactiva"} />
              </td>
              <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEditCoords(c)}
                    className="btn-secondary px-3.5 py-2 text-xs"
                    title={
                      c.latitud != null && c.longitud != null
                        ? "Editar coordenadas"
                        : "Agregar coordenadas"
                    }
                  >
                    <MapPin className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onToggleEstado(c)}
                    className={
                      c.estado === "activa"
                        ? "btn-danger px-3.5 py-2 text-xs"
                        : "btn-secondary px-3.5 py-2 text-xs"
                    }
                  >
                    {c.estado === "activa" ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
