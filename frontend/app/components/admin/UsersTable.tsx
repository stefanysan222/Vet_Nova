"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import EditUserModal from "./EditUserModal";
import { fetchUsuarios, deleteUsuario, type UsuarioAPI } from "../../../lib/api/usuarios";
import { useToast } from "../ui/Toast";
import ConfirmDialog from "../ui/ConfirmDialog";

function getInitials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("");
}

function roleStyle(role: string): { bg: string; dot: string } {
  if (role.toLowerCase().includes("veterin"))
    return { bg: "bg-brand-50 text-brand-700 border border-brand-200", dot: "bg-brand-500" };
  if (role.toLowerCase().includes("admin"))
    return { bg: "bg-slate-100 text-slate-700 border border-slate-200", dot: "bg-slate-400" };
  return { bg: "bg-sky-50 text-sky-700 border border-sky-200", dot: "bg-sky-400" };
}

export default function UsersTable({ refreshTrigger = 0 }: { refreshTrigger?: number }) {
  const [users, setUsers] = useState<UsuarioAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UsuarioAPI | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmUser, setConfirmUser] = useState<UsuarioAPI | null>(null);
  const { success, error } = useToast();

  const cargar = () => {
    setLoading(true);
    fetchUsuarios()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Recargar la lista al montar y cada vez que el padre dispara refreshTrigger
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, [refreshTrigger]);

  const handleDeleteConfirm = async () => {
    // Capturar el usuario antes de limpiar el estado para evitar problemas de closure
    const usuario = confirmUser;
    if (!usuario) return;
    setConfirmUser(null);
    setDeletingId(usuario.id);
    try {
      await deleteUsuario(usuario.id);
      setUsers((prev) => prev.filter((u) => u.id !== usuario.id));
      success(
        "Usuario eliminado",
        `${usuario.nombre ?? usuario.email} fue eliminado correctamente.`,
      );
    } catch (err) {
      error(
        "Error al eliminar",
        err instanceof Error ? err.message : "No se pudo eliminar el usuario.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/40 dark:border-slate-700 dark:bg-slate-950 dark:shadow-slate-900/40">
      <div className="mb-2">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Usuarios activos
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Revisa y administra el acceso de cada miembro del equipo.
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando usuarios...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-slate-500">No hay usuarios registrados.</p>
        ) : (
          users.map((user) => (
            <motion.article
              key={user.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-950 dark:hover:shadow-slate-900/40"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-xl font-semibold text-white shadow-lg shadow-brand-600/10">
                    {getInitials(user.nombre)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                      {user.nombre ?? "Sin nombre"}
                    </p>
                    <div className="mt-2">
                      {(() => {
                        const rs = roleStyle(user.rol);
                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${rs.bg}`}
                          >
                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${rs.dot}`} />
                            {user.rol}
                          </span>
                        );
                      })()}
                    </div>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowEdit(true);
                    }}
                    className="btn-secondary"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => setConfirmUser(user)}
                    disabled={deletingId === user.id}
                    className="btn-danger disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deletingId === user.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </div>
            </motion.article>
          ))
        )}
      </div>

      <EditUserModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        onUpdated={cargar}
        user={
          selectedUser
            ? {
                id: selectedUser.id,
                name: selectedUser.nombre ?? "",
                email: selectedUser.email,
                role: selectedUser.rol,
              }
            : null
        }
      />

      <ConfirmDialog
        open={!!confirmUser}
        title={`¿Eliminar a ${confirmUser?.nombre ?? confirmUser?.email}?`}
        description="Esta acción no se puede deshacer. El usuario perderá acceso al sistema permanentemente."
        confirmLabel="Sí, eliminar"
        cancelLabel="No, cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmUser(null)}
      />
    </section>
  );
}
