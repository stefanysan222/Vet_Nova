"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchClinicas, updateClinica, type Clinica } from "../../../lib/api/clinicas";
import AddressAutocomplete from "../../components/maps/AddressAutocomplete";
import MapPreview from "../../components/maps/MapPreview";
import { useToast } from "../../components/ui/Toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ClinicasTable from "../../components/super-admin/ClinicasTable";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const inputClass = "form-input";

const cardClass =
  "rounded-[13px] border-[0.5px] border-[#E4DFF0] bg-white px-4 py-3.5 dark:border-slate-700/60 dark:bg-slate-900";

/**
 * Listado completo de clínicas para Super-Admin.
 * Reutiliza la consulta a /clinicas y el componente ClinicasTable que
 * también usa el dashboard de app/super-admin/page.tsx, para no duplicar
 * la UI de la tabla. El detalle completo de clínica (cambio de admin,
 * historial de administradores) sigue viviendo en el dashboard principal;
 * aquí se exponen las acciones rápidas de edición de ubicación y
 * activar/desactivar.
 */
export default function SuperAdminClinicasPage() {
  const router = useRouter();
  const { success, error: notifyError } = useToast();
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggleTarget, setToggleTarget] = useState<Clinica | null>(null);
  const [toggling, setToggling] = useState(false);
  const [coordsTarget, setCoordsTarget] = useState<Clinica | null>(null);
  const [coordsForm, setCoordsForm] = useState({
    direccion: "",
    latitud: null as number | null,
    longitud: null as number | null,
  });
  const [coordsError, setCoordsError] = useState("");
  const [savingCoords, setSavingCoords] = useState(false);

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

  const handleCopyLink = async (slug: string, nombre: string) => {
    const url = `${window.location.origin}/register?clinica=${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      success("Enlace copiado", `Enlace de registro de ${nombre} copiado al portapapeles.`);
    } catch {
      notifyError("No se pudo copiar", "Copia el enlace manualmente: " + url);
    }
  };

  const openCoordsModal = (c: Clinica) => {
    setCoordsTarget(c);
    setCoordsForm({
      direccion: c.direccion || "",
      latitud: c.latitud ?? null,
      longitud: c.longitud ?? null,
    });
    setCoordsError("");
  };

  const closeCoordsModal = () => {
    setCoordsTarget(null);
    setCoordsForm({ direccion: "", latitud: null, longitud: null });
    setCoordsError("");
  };

  const handleCoordsDireccionChange = (value: string) => {
    setCoordsError("");
    setCoordsForm((prev) => ({ ...prev, direccion: value, latitud: null, longitud: null }));
  };

  const handleCoordsDireccionSelect = ({
    direccion,
    latitud,
    longitud,
  }: {
    direccion: string;
    latitud: number;
    longitud: number;
  }) => {
    setCoordsError("");
    setCoordsForm({ direccion, latitud, longitud });
  };

  const handleSaveCoords = async () => {
    if (!coordsTarget) return;
    setSavingCoords(true);
    setCoordsError("");
    try {
      await updateClinica(coordsTarget.id, {
        direccion: coordsForm.direccion.trim() || undefined,
        latitud: coordsForm.latitud ?? undefined,
        longitud: coordsForm.longitud ?? undefined,
      });
      success(
        "Ubicación actualizada",
        `La ubicación de ${coordsTarget.nombre} se guardó correctamente.`,
      );
      closeCoordsModal();
      cargar();
    } catch (err) {
      setCoordsError(err instanceof Error ? err.message : "No se pudo actualizar la ubicación.");
    } finally {
      setSavingCoords(false);
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

  // El detalle completo (cambio de administrador, historial) vive en el
  // dashboard principal; aquí redirigimos al ancla de la fila para
  // reutilizar ese drawer sin duplicar su lógica.
  const goToDetail = (c: Clinica) => {
    router.push(`/super-admin#clinica-row-${c.id}`);
  };

  return (
    <div className="admin-page bg-[#F7F6FA] dark:bg-transparent">
      <section className={cardClass}>
        <div>
          <h1 className="text-page-title text-slate-900 dark:text-white">
            Veterinarias registradas
          </h1>
          <p className="mt-0.5 text-[11px] text-[#555068] dark:text-slate-400">
            Listado completo de clínicas que usan VetNova. Haz clic en una fila para ver su detalle
            completo (administrador e historial) en el panel principal.
          </p>
        </div>
        <div className="mt-4">
          <ClinicasTable
            clinicas={clinicas}
            loading={loading}
            onRowClick={goToDetail}
            onCopyLink={handleCopyLink}
            onEditCoords={openCoordsModal}
            onToggleEstado={setToggleTarget}
          />
        </div>
      </section>

      {/* Modal editar ubicación */}
      <AnimatePresence>
        {coordsTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/50 px-4 backdrop-blur-sm"
            onClick={closeCoordsModal}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 12 }}
              transition={{ type: "spring", bounce: 0.18, duration: 0.38 }}
              className="w-full max-w-md overflow-hidden rounded-3xl border border-surface-200/60 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Ubicación de {coordsTarget.nombre}
                </h2>
                <button
                  onClick={closeCoordsModal}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4 p-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Busca y selecciona la dirección de la clínica para actualizar su ubicación en el
                  mapa y calcular la distancia con los usuarios al registrarse.
                </p>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Dirección
                  </label>
                  <AddressAutocomplete
                    value={coordsForm.direccion}
                    onChange={handleCoordsDireccionChange}
                    onSelect={handleCoordsDireccionSelect}
                    placeholder="Busca la dirección de la clínica..."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Vista previa del mapa
                  </label>
                  <MapPreview lat={coordsForm.latitud} lng={coordsForm.longitud} />
                </div>
                {coordsError && (
                  <div className="dark:bg-danger-950/30 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-800 dark:text-danger-300">
                    {coordsError}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
                <button type="button" onClick={closeCoordsModal} className="btn-secondary">
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveCoords}
                  disabled={savingCoords}
                  className="btn-primary"
                >
                  {savingCoords ? "Guardando..." : "Guardar"}
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
    </div>
  );
}
