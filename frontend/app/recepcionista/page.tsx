"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ClipboardList, CreditCard, HeartPulse, Home, PawPrint, PlusCircle, ShieldCheck, Users2 } from "lucide-react";
import { getCurrentUser, AuthUser } from "../../lib/auth";
import AddPetModal, { PetRecord } from "../components/admin/AddPetModal";

type Owner = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
};

type Appointment = {
  id: string;
  time: string;
  petName: string;
  ownerName: string;
  service: string;
  status: "Pendiente" | "Confirmada" | "Completada" | "Cancelada";
};

type ServiceItem = {
  id: string;
  name: string;
  available: number;
  type: "Inventario" | "Servicio";
};

const initialOwners: Owner[] = [
  { id: "o1", name: "Claudia Ríos", email: "claudia.rios@mail.com", phone: "+57 300 123 4567", address: "Calle 45 #12-34" },
  { id: "o2", name: "Andrés Castillo", email: "andres.castillo@mail.com", phone: "+57 310 987 6543", address: "Carrera 10 #7-89" },
];

const initialPets: PetRecord[] = [
  { id: "p1", nombre: "Milo", especie: "Perro", raza: "Beagle", edad: "4 años", peso: "12 kg", propietario: "Claudia Ríos", foto: "" },
  { id: "p2", nombre: "Luna", especie: "Gato", raza: "Siamés", edad: "2 años", peso: "4.2 kg", propietario: "Andrés Castillo", foto: "" },
];

const initialAppointments: Appointment[] = [
  { id: "a1", time: "09:30", petName: "Milo", ownerName: "Claudia Ríos", service: "Consulta general", status: "Pendiente" },
  { id: "a2", time: "11:00", petName: "Luna", ownerName: "Andrés Castillo", service: "Vacunación", status: "Confirmada" },
  { id: "a3", time: "14:00", petName: "Milo", ownerName: "Claudia Ríos", service: "Control posoperatorio", status: "Pendiente" },
];

const serviceCatalog: ServiceItem[] = [
  { id: "s1", name: "Vacuna antirrábica", available: 12, type: "Inventario" },
  { id: "s2", name: "Consulta general", available: 20, type: "Servicio" },
  { id: "s3", name: "Desparasitación", available: 10, type: "Servicio" },
  { id: "s4", name: "Shampoo medicado", available: 8, type: "Inventario" },
];

const menuItems = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "usuarios", label: "Usuarios", icon: Users2 },
  { key: "mascotas", label: "Mascotas", icon: PawPrint },
  { key: "citas", label: "Citas", icon: CalendarDays },
  { key: "inventario", label: "Inventario", icon: CreditCard },
] as const;

type SectionKey = (typeof menuItems)[number]["key"];

export default function RecepcionistaPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [owners, setOwners] = useState<Owner[]>(initialOwners);
  const [pets, setPets] = useState<PetRecord[]>(initialPets);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [activeSection, setActiveSection] = useState<SectionKey>("dashboard");
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<PetRecord | undefined>(undefined);
  const [newOwner, setNewOwner] = useState({ name: "", email: "", phone: "", address: "" });

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const inventoryItems = useMemo(() => serviceCatalog.filter((item) => item.type === "Inventario"), []);

  const registerOwner = () => {
    if (!newOwner.name || !newOwner.email) return;
    setOwners((current) => [
      ...current,
      {
        id: `o${Date.now()}`,
        name: newOwner.name,
        email: newOwner.email,
        phone: newOwner.phone,
        address: newOwner.address,
      },
    ]);
    setNewOwner({ name: "", email: "", phone: "", address: "" });
  };

  const handleSavePet = (pet: PetRecord) => {
    setPets((current) => {
      const exists = current.some((item) => item.id === pet.id);
      return exists ? current.map((item) => (item.id === pet.id ? pet : item)) : [pet, ...current];
    });
  };

  const openNewPet = () => {
    setSelectedPet(undefined);
    setIsPetModalOpen(true);
  };

  const openEditPet = (pet: PetRecord) => {
    setSelectedPet(pet);
    setIsPetModalOpen(true);
  };

  const updateAppointmentStatus = (id: string, status: Appointment["status"]) => {
    setAppointments((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  return (
    <div className="space-y-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-[28px] border border-slate-200/70 bg-white p-8 shadow-sm shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">Recepcionista</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900 dark:text-white">
          Bienvenido{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
          Usa el menú de la izquierda para navegar por usuarios, mascotas, citas e inventario. En mascotas puedes registrar nuevas y subir su foto.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40 dark:border-slate-700 dark:bg-slate-900">
          <div className="rounded-[2rem] border border-slate-200 bg-blue-50 p-4 dark:border-slate-700 dark:bg-blue-900/20">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-200">Menú de recepcionista</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Selecciona una sección para gestionar datos.</p>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveSection(item.key)}
                  className={`flex w-full items-center gap-3 rounded-3xl px-4 py-4 text-left text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="space-y-6">
          {activeSection === "dashboard" && (
            <section className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Dashboard</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Resumen rápido de la recepción.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  <ShieldCheck className="h-4 w-4" />
                  Recepción activa
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-[20px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Propietarios</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{owners.length}</p>
                </article>
                <article className="rounded-[20px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Mascotas</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{pets.length}</p>
                </article>
                <article className="rounded-[20px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Citas</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{appointments.filter((item) => item.status === "Pendiente").length}</p>
                </article>
                <article className="rounded-[20px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Inventario</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{inventoryItems.length}</p>
                </article>
              </div>
            </section>
          )}

          {activeSection === "usuarios" && (
            <section className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Usuarios</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Registra y revisa propietarios desde recepción.</p>
                </div>
              </div>
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Propietarios registrados</h3>
                  {owners.map((owner) => (
                    <div key={owner.id} className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{owner.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{owner.email}</p>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{owner.phone}</p>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{owner.address}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Registrar nuevo propietario</h3>
                  <div className="mt-5 space-y-4">
                    <input
                      value={newOwner.name}
                      onChange={(event) => setNewOwner((prev) => ({ ...prev, name: event.target.value }))}
                      className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Nombre completo"
                    />
                    <input
                      value={newOwner.email}
                      onChange={(event) => setNewOwner((prev) => ({ ...prev, email: event.target.value }))}
                      className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Correo electrónico"
                    />
                    <input
                      value={newOwner.phone}
                      onChange={(event) => setNewOwner((prev) => ({ ...prev, phone: event.target.value }))}
                      className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Teléfono"
                    />
                    <input
                      value={newOwner.address}
                      onChange={(event) => setNewOwner((prev) => ({ ...prev, address: event.target.value }))}
                      className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Dirección"
                    />
                    <button
                      type="button"
                      onClick={registerOwner}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <PlusCircle className="h-5 w-5" />
                      Guardar propietario
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === "mascotas" && (
            <section className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Mascotas</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Registra mascotas nuevas con foto y edita las ya existentes.</p>
                </div>
                <button
                  type="button"
                  onClick={openNewPet}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <PlusCircle className="h-5 w-5" />
                  Agregar mascota
                </button>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {pets.map((pet) => (
                  <article key={pet.id} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 overflow-hidden rounded-3xl bg-slate-200 dark:bg-slate-800">
                        {pet.foto ? (
                          <img src={pet.foto} alt={pet.nombre} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-500">Sin foto</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{pet.nombre}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{pet.especie} · {pet.raza}</p>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Propietario: {pet.propietario}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Edad: {pet.edad} · Peso: {pet.peso}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditPet(pet)}
                        className="rounded-full border border-blue-600 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        Editar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <AddPetModal
                isOpen={isPetModalOpen}
                onClose={() => setIsPetModalOpen(false)}
                onSave={handleSavePet}
                initialPet={selectedPet}
              />
            </section>
          )}

          {activeSection === "citas" && (
            <section className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Gestionar citas</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Actualiza el estado de las citas desde recepción.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  <HeartPulse className="h-4 w-4" />
                  Atención al cliente
                </div>
              </div>

              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{appointment.service}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{appointment.petName} • {appointment.ownerName}</p>
                      </div>
                      <span className={`rounded-2xl px-3 py-1 text-sm font-semibold ${
                        appointment.status === "Confirmada"
                          ? "bg-blue-100 text-blue-700"
                          : appointment.status === "Completada"
                          ? "bg-emerald-100 text-emerald-700"
                          : appointment.status === "Cancelada"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updateAppointmentStatus(appointment.id, "Confirmada")}
                        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Confirmar
                      </button>
                      <button
                        type="button"
                        onClick={() => updateAppointmentStatus(appointment.id, "Completada")}
                        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        Marcar completada
                      </button>
                      <button
                        type="button"
                        onClick={() => updateAppointmentStatus(appointment.id, "Cancelada")}
                        className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                      >
                        Cancelar
                      </button>
                    </div>
                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Hora: {appointment.time}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeSection === "inventario" && (
            <section className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Inventario</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Consulta los servicios e inventario gestionables desde recepción.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  <ClipboardList className="h-4 w-4" />
                  Inventario disponible
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {serviceCatalog.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{item.type}</p>
                    <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{item.available}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
