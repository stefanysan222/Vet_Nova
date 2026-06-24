"use client";

import { Users2 } from "lucide-react";

const cardClass =
  "rounded-[13px] border-[0.5px] border-[#E4DFF0] bg-white px-4 py-3.5 dark:border-slate-700/60 dark:bg-slate-900";

/**
 * Listado de usuarios a nivel global para Super-Admin.
 *
 * LIMITACIÓN CONOCIDA (LP-04): el backend solo expone GET /usuarios
 * (ver frontend/lib/api/usuarios.ts -> fetchUsuarios), y ese endpoint
 * está scopeado a la clínica del usuario autenticado vía JWT (lo
 * consume exclusivamente app/admin/usuarios, con rol Administrador).
 * No existe en el backend un endpoint cross-clínica que permita a
 * SuperAdministrador listar usuarios de todas las clínicas.
 *
 * Para esta tarea de bajo impacto NO se agrega un endpoint nuevo en el
 * backend (fuera de alcance / requeriría su propio guard de rol y
 * migración de consultas). En su lugar, se documenta la limitación
 * aquí y se muestra un estado vacío claro en vez de inventar datos.
 *
 * Cuando exista un endpoint tipo GET /super-admin/usuarios (o
 * /usuarios?clinicaId=all) protegido con el guard de SuperAdministrador,
 * esta página debe reemplazar este estado vacío por el listado real,
 * idealmente reutilizando el patrón de tabla/paginación ya usado en
 * app/admin/usuarios (UsersTable) y en ClinicasTable.
 */
export default function SuperAdminUsuariosPage() {
  return (
    <div className="admin-page bg-[#F7F6FA] dark:bg-transparent">
      <section className={cardClass}>
        <div>
          <h1 className="text-page-title text-slate-900 dark:text-white">Usuarios globales</h1>
          <p className="mt-0.5 text-[11px] text-[#555068] dark:text-slate-400">
            Vista global de usuarios de todas las clínicas que usan VetNova.
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 py-16 text-center dark:border-slate-700 dark:bg-slate-800/40">
          <Users2 className="h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
            Todavía no hay un endpoint en el backend para listar usuarios de todas las clínicas a la
            vez. El endpoint actual (<code className="font-mono text-xs">GET /usuarios</code>) solo
            devuelve los usuarios de la clínica del usuario autenticado.
          </p>
          <p className="max-w-md text-xs text-slate-400 dark:text-slate-500">
            Para gestionar usuarios de una clínica específica, entra a su panel desde{" "}
            <span className="font-semibold">Veterinarias</span> y usa la gestión de administrador, o
            pide a cada clínica que administre sus usuarios desde su propio panel de Administrador.
          </p>
        </div>
      </section>
    </div>
  );
}
