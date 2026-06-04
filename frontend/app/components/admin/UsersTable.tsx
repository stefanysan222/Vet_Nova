"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Pencil, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import PermissionsModal from "./PermissionsModal";
import EditUserModal from "./EditUserModal";
import { fetchUsuarios, type UsuarioAPI } from "../../../lib/api/usuarios";

function getInitials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("");
}

function roleStyle(role: string) {
  if (role.toLowerCase().includes("veterin")) return "bg-blue-100 text-blue-700";
  if (role.toLowerCase().includes("admin")) return "bg-slate-100 text-slate-700";
  return "bg-sky-100 text-sky-700";
}

export default function UsersTable() {
  const [users, setUsers] = useState<UsuarioAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UsuarioAPI | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    fetchUsuarios()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40 dark:border-slate-700 dark:bg-slate-950 dark:shadow-slate-900/40">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Usuarios activos</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Revisa y administra el acceso de cada miembro del equipo.
          </p>
        </div>
        <button className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(37,99,235,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </button>
      </div>

      <div className="mt-6 grid gap-4">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando usuarios...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-slate-500">No hay usuarios registrados.</p>
        ) : (
          users.map((user) => (
            <motion.article
              key={user.email}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-950 dark:hover:shadow-slate-900/40"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-xl font-semibold text-white shadow-lg shadow-blue-600/10">
                    {getInitials(user.nombre)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                          {user.nombre ?? "Sin nombre"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className={`rounded-2xl border border-slate-200 px-3 py-1 text-xs font-semibold tracking-wide ${roleStyle(user.rol)} dark:border-slate-700`}>
                            {user.rol}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Contacto</p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => { setSelectedUser(user); setShowEdit(true); }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition duration-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => { setSelectedUser(user); setShowPermissions(true); }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-blue-700"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Permisos
                  </button>
                </div>
              </div>
            </motion.article>
          ))
        )}
      </div>

      <PermissionsModal
        isOpen={showPermissions}
        onClose={() => setShowPermissions(false)}
        user={selectedUser ? { name: selectedUser.nombre ?? "", email: selectedUser.email, role: selectedUser.rol } : null}
      />
      <EditUserModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        user={selectedUser ? { name: selectedUser.nombre ?? "", email: selectedUser.email, role: selectedUser.rol } : null}
      />
    </section>
  );
}
