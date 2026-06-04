"use client";

import {
  Eye,
  Loader2,
  Mail,
  MapPin,
  PawPrint,
  Phone,
  Plus,
  Search,
  UserCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getOwners, addOwner, saveOwner } from "../../../lib/recepcionista/storage";
import type { Owner } from "../../../lib/recepcionista/types";
import OwnerFormModal from "../components/OwnerFormModal";
import SearchInput from "../components/SearchInput";

const cardHover =
  "transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(37,99,235,0.12)]";

const buttonHover =
  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]";

const iconHover =
  "transition-all duration-300 group-hover:scale-110 group-hover:rotate-3";

export default function RecepcionistaClientesPage() {
  const [clients, setClients] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<"Todos" | "Activo" | "Inactivo">("Todos");

  async function loadClients() {
    setLoading(true);
    try {
      const data = await getOwners();
      setClients(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();
    return clients.filter((client) => {
      const matchesSearch = `${client.name} ${client.email} ${client.phone} ${client.address} ${client.documento ?? ""}`
        .toLowerCase()
        .includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "Todos" ||
        (statusFilter === "Activo" && client.estado !== "Inactivo") ||
        (statusFilter === "Inactivo" && client.estado === "Inactivo");
      return matchesSearch && matchesStatus;
    });
  }, [clients, search, statusFilter]);

  const activeClients = useMemo(
    () => clients.filter((c) => c.estado !== "Inactivo").length,
    [clients],
  );
  const inactiveClients = useMemo(
    () => clients.filter((c) => c.estado === "Inactivo").length,
    [clients],
  );
  const associatedPets = useMemo(
    () => clients.reduce((total, c) => total + (c.mascotas?.length ?? 0), 0),
    [clients],
  );

  const handleSave = async (owner: Owner) => {
    try {
      setSaveError(null);
      if (owner.id && clients.some((c) => c.id === owner.id)) {
        await saveOwner(owner);
      } else {
        await addOwner({
          name: owner.name,
          email: owner.email,
          phone: owner.phone,
          address: owner.address,
          documento: owner.documento,
          estado: owner.estado,
        });
      }
      await loadClients();
      setModalOpen(false);
      setSelectedOwner(undefined);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar. Verifica que el servidor esté activo.");
    }
  };

  return (
    <div className="space-y-6">
      {saveError && (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          {saveError}
        </div>
      )}
      <section className={`group relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${cardHover}`}>
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-blue-100 blur-3xl transition-transform duration-700 group-hover:scale-125 dark:bg-blue-900/20" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-cyan-100 blur-3xl dark:bg-cyan-900/20" />
        <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Clientes</p>
            <h1 className="mt-1 text-3xl font-black text-[#1e293b] dark:text-white">Gestión de clientes</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#64748b] dark:text-slate-400">
              Crea, consulta y administra los datos básicos de propietarios, información de contacto y mascotas asociadas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setSelectedOwner(undefined); setModalOpen(true); }}
            className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#2563eb] px-5 py-3 text-sm font-bold text-white shadow-sm shadow-[#2563eb]/20 transition hover:bg-[#1d4ed8] ${buttonHover}`}
          >
            <Plus className="h-5 w-5" />
            Nuevo cliente
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className={`group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${cardHover}`}>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total clientes</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
              <UsersRound className={`h-5 w-5 ${iconHover}`} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">
            {loading ? "—" : clients.length}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Registros disponibles</p>
        </article>

        <article className={`group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${cardHover}`}>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-green-500 to-emerald-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Activos</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-green-600 transition-colors duration-300 group-hover:bg-green-600 group-hover:text-white">
              <UserCheck className={`h-5 w-5 ${iconHover}`} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">
            {loading ? "—" : activeClients}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Clientes habilitados</p>
        </article>

        <article className={`group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${cardHover}`}>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Mascotas asociadas</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 transition-colors duration-300 group-hover:bg-cyan-600 group-hover:text-white">
              <PawPrint className={`h-5 w-5 ${iconHover}`} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">
            {loading ? "—" : associatedPets}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Vinculadas a propietarios</p>
        </article>

        <article className={`group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${cardHover}`}>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-red-400 to-rose-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Inactivos</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 transition-colors duration-300 group-hover:bg-rose-500 group-hover:text-white">
              <UserRound className={`h-5 w-5 ${iconHover}`} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">
            {loading ? "—" : inactiveClients}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Clientes deshabilitados</p>
        </article>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-xl">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar cliente por nombre, documento, teléfono o correo..."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["Todos", "Activo", "Inactivo"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={[
                  "rounded-full border px-4 py-2 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]",
                  statusFilter === status
                    ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
                ].join(" ")}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[22px] border border-[#e2e8f0] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#e2e8f0] bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-[#1e293b] dark:text-white">Lista de clientes</h2>
              <p className="text-sm font-medium text-[#64748b] dark:text-slate-400">
                {loading ? "Cargando..." : `${filteredClients.length} resultado(s) encontrados`}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eff6ff] px-4 py-2 text-sm font-bold text-[#2563eb]">
              <Search className="h-4 w-4" />
              Vista recepción
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#64748b]">
              <tr>
                <th className="px-5 py-4">Cliente</th>
                <th className="px-5 py-4">Documento</th>
                <th className="px-5 py-4">Contacto</th>
                <th className="px-5 py-4">Dirección</th>
                <th className="px-5 py-4">Mascotas</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                  </td>
                </tr>
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client.id} className="group transition-all duration-300 hover:bg-[#f8fafc]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#2563eb] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#2563eb] group-hover:text-white">
                          <UserRound className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-black text-[#1e293b] dark:text-white">{client.name}</p>
                          <p className="text-xs font-semibold text-[#64748b] dark:text-slate-400">
                            {client.email || "Sin correo"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-[#334155] dark:text-slate-300">
                      {client.documento || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <p className="inline-flex items-center gap-2 font-bold text-[#1e293b] dark:text-white">
                          <Phone className="h-4 w-4 text-[#2563eb]" />
                          {client.phone || "Sin teléfono"}
                        </p>
                        <p className="inline-flex items-center gap-2 text-xs text-[#64748b] dark:text-slate-400">
                          <Mail className="h-4 w-4 text-[#2563eb]" />
                          {client.email || "Sin correo"}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#334155] dark:text-slate-300">
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#2563eb]" />
                        {client.address || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-[#2563eb]">
                        <PawPrint className="h-4 w-4" />
                        <span className="font-black">{client.mascotas?.length ?? 0}</span>
                      </div>
                      <p className="mt-1 max-w-[190px] truncate text-xs text-[#64748b] dark:text-slate-400">
                        {client.mascotas && client.mascotas.length > 0
                          ? client.mascotas.join(", ")
                          : "Sin mascotas"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={[
                        "rounded-full border px-3 py-1 text-xs font-black",
                        client.estado !== "Inactivo"
                          ? "border-[#bbf7d0] bg-[#ecfdf5] text-[#10b981]"
                          : "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]",
                      ].join(" ")}>
                        {client.estado !== "Inactivo" ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => { setSelectedOwner(client); setModalOpen(true); }}
                          className={`rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 ${buttonHover}`}
                        >
                          <Eye className="mr-1 inline h-4 w-4" />
                          Editar
                        </button>
                        <button
                          type="button"
                          className={`rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 ${buttonHover}`}
                        >
                          <PawPrint className="mr-1 inline h-4 w-4" />
                          Mascotas
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="mx-auto flex max-w-md flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#2563eb]">
                        <UsersRound className="h-7 w-7" />
                      </div>
                      <p className="mt-4 text-sm font-black text-[#1e293b] dark:text-white">
                        {clients.length === 0 ? "No hay clientes registrados" : "No se encontraron clientes"}
                      </p>
                      <p className="mt-2 text-sm text-[#64748b] dark:text-slate-400">
                        {clients.length === 0
                          ? "Registra el primer cliente usando el botón de arriba."
                          : "Intenta cambiar el filtro o buscar por otro dato."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <OwnerFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedOwner(undefined); }}
        onSave={handleSave}
        initialOwner={selectedOwner}
      />
    </div>
  );
}
