"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Mail, MapPin, Phone, Plus, X } from "lucide-react";
import { fetchClinicas, createClinica, updateClinica, type Clinica } from "../../lib/api/clinicas";
import { SkeletonCardList } from "../components/ui/Skeleton";
import { useToast } from "../components/ui/Toast";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import StatusBadge from "../components/ui/StatusBadge";

const inputClass = "form-input";

const emptyForm = {
  nombre: "",
  slug: "",
  direccion: "",
  telefono: "",
  email: "",
  adminNombre: "",
  adminEmail: "",
  adminPassword: "",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function SuperAdminPage() {
  const { success, error: notifyError } = useToast();
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [slugEdited, setSlugEdited] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<Clinica | null>(null);
  const [toggling, setToggling] = useState(false);

  const cargar = () => {
    setLoading(true);
    fetchClinicas()
      .then(setClinicas)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormError("");
    if (name === "nombre") {
      setForm((prev) => ({
        ...prev,
        nombre: value,
        slug: slugEdited ? prev.slug : slugify(value),
      }));
      return;
    }
    if (name === "slug") {
      setSlugEdited(true);
      setForm((prev) => ({ ...prev, slug: slugify(value) }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(emptyForm);
    setSlugEdited(false);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.slug.trim()) {
      setFormError("El nombre y el slug de la clínica son obligatorios.");
      return;
    }
    if (!form.adminNombre.trim() || !form.adminEmail.trim() || !form.adminPassword.trim()) {
      setFormError("Completa los datos del administrador inicial.");
      return;
    }
    if (form.adminPassword.length < 8) {
      setFormError("La contraseña del administrador debe tener al menos 8 caracteres.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await createClinica({
        nombre: form.nombre.trim(),
        slug: form.slug.trim(),
        direccion: form.direccion.trim() || undefined,
        telefono: form.telefono.trim() || undefined,
        email: form.email.trim() || undefined,
        adminNombre: form.adminNombre.trim(),
        adminEmail: form.adminEmail.trim(),
        adminPassword: form.adminPassword,
      });
      success("Clínica registrada", "La clínica y su administrador se crearon correctamente.");
      closeForm();
      cargar();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al registrar la clínica.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEstado = async () => {
    if (!toggleTarget) return;
    setToggling(true);
    const nuevoEstado = toggleTarget.estado === "activa" ? "inactiva" : "activa";
    try {
      await updateClinica(toggleTarget.id, { estado: nuevoEstado });
      success(
        nuevoEstado === "activa" ? "Clínica activada" : "Clínica desactivada",
        `${toggleTarget.nombre} ahora está ${nuevoEstado}.`,
      );
      setToggleTarget(null);
      cargar();
    } catch (err) {
      notifyError(
        "Error al actualizar",
        err instanceof Error ? err.message : "No se pudo actualizar el estado de la clínica.",
      );
    } finally {
      setToggling(false);
    }
  };

  return (
    <>
      <div className="admin-page">
        <section className="admin-card-padded">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-eyebrow">Super Administración</p>
              <h1 className="text-page-title mt-2">Veterinarias registradas</h1>
              <p className="text-subtitle mt-1">
                Gestiona las clínicas que usan VetNova y su administrador inicial.
              </p>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-primary shrink-0">
              <Plus className="h-4 w-4" />
              Nueva clínica
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {loading ? "—" : clinicas.length}
              </p>
            </article>
            <article className="dark:bg-success-950/20 rounded-2xl border border-success-200/70 bg-success-50 p-4 dark:border-success-900/50">
              <p className="text-xs font-medium text-success-600 dark:text-success-400">Activas</p>
              <p className="mt-1 text-2xl font-bold text-success-800 dark:text-success-300">
                {loading ? "—" : clinicas.filter((c) => c.estado === "activa").length}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Inactivas</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {loading ? "—" : clinicas.filter((c) => c.estado !== "activa").length}
              </p>
            </article>
          </div>

          {/* Lista */}
          <div className="mt-6">
            {loading ? (
              <SkeletonCardList count={4} />
            ) : clinicas.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 py-14 text-center dark:border-slate-700 dark:bg-slate-800/40">
                <Building2 className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Todavía no hay clínicas registradas.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {clinicas.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900 dark:text-white">{c.nombre}</p>
                          <StatusBadge status={c.estado === "activa" ? "Activa" : "Inactiva"} />
                        </div>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                          /register?clinica={c.slug}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                          {c.direccion && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {c.direccion}
                            </span>
                          )}
                          {c.telefono && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {c.telefono}
                            </span>
                          )}
                          {c.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {c.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setToggleTarget(c)}
                      className={
                        c.estado === "activa"
                          ? "btn-danger shrink-0 self-start sm:self-auto"
                          : "btn-secondary shrink-0 self-start sm:self-auto"
                      }
                    >
                      {c.estado === "activa" ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal nueva clínica */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/50 px-4 backdrop-blur-sm"
            onClick={closeForm}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 12 }}
              transition={{ type: "spring", bounce: 0.18, duration: 0.38 }}
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-surface-200/60 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nueva clínica</h2>
                <button
                  onClick={closeForm}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <form id="form-clinica" onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-section-title mb-3">Datos de la clínica</h3>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Nombre *
                        </label>
                        <input
                          name="nombre"
                          value={form.nombre}
                          onChange={handleChange}
                          placeholder="Nombre de la clínica"
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Slug (enlace de registro) *
                        </label>
                        <input
                          name="slug"
                          value={form.slug}
                          onChange={handleChange}
                          placeholder="mi-clinica"
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Dirección
                        </label>
                        <input
                          name="direccion"
                          value={form.direccion}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Teléfono
                        </label>
                        <input
                          name="telefono"
                          value={form.telefono}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Email de la clínica
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-section-title mb-3">Administrador inicial</h3>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Nombre *
                        </label>
                        <input
                          name="adminNombre"
                          value={form.adminNombre}
                          onChange={handleChange}
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="adminEmail"
                          value={form.adminEmail}
                          onChange={handleChange}
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Contraseña *
                        </label>
                        <input
                          type="password"
                          name="adminPassword"
                          value={form.adminPassword}
                          onChange={handleChange}
                          className={inputClass}
                          minLength={8}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {formError && (
                    <div className="dark:bg-danger-950/30 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-800 dark:text-danger-300">
                      {formError}
                    </div>
                  )}
                </form>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
                <button type="button" onClick={closeForm} className="btn-secondary">
                  Cancelar
                </button>
                <button form="form-clinica" type="submit" disabled={saving} className="btn-primary">
                  {saving ? "Guardando..." : "Registrar clínica"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmación activar/desactivar */}
      <ConfirmDialog
        open={toggleTarget !== null}
        title={toggleTarget?.estado === "activa" ? "Desactivar clínica" : "Activar clínica"}
        description={
          toggleTarget
            ? toggleTarget.estado === "activa"
              ? `¿Seguro que deseas desactivar "${toggleTarget.nombre}"? Sus usuarios no podrán registrarse mediante su enlace mientras esté inactiva.`
              : `¿Deseas reactivar "${toggleTarget.nombre}"?`
            : ""
        }
        confirmLabel={
          toggling ? "Guardando..." : toggleTarget?.estado === "activa" ? "Desactivar" : "Activar"
        }
        cancelLabel="Cancelar"
        variant={toggleTarget?.estado === "activa" ? "danger" : "warning"}
        onConfirm={handleToggleEstado}
        onCancel={() => setToggleTarget(null)}
      />
    </>
  );
}
