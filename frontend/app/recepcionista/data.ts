import {
  Bell,
  CalendarCheck,
  CalendarClock,
  Clock,
  Package,
  PawPrint,
  Stethoscope,
  UserRound,
  XCircle,
} from "lucide-react";

export const ui = {
  page: "bg-[#f8fafc] text-[#1e293b]",
  card: "rounded-[22px] border border-[#e2e8f0] bg-white shadow-sm",
  cardHover:
    "transition-all duration-200 hover:-translate-y-0.5 hover:border-[#bfdbfe] hover:shadow-md",
  softCard: "rounded-[18px] border border-[#e2e8f0] bg-[#f8fafc]",
  title: "text-[#1e293b]",
  muted: "text-[#64748b]",
  border: "border-[#e2e8f0]",
  primaryButton:
    "rounded-2xl bg-[#2563eb] px-5 py-3 text-sm font-bold text-white shadow-sm shadow-[#2563eb]/20 transition hover:bg-[#1d4ed8]",
  secondaryButton:
    "rounded-2xl border border-[#e2e8f0] bg-white px-5 py-3 text-sm font-bold text-[#2563eb] transition hover:bg-[#eff6ff]",
  subtleButton:
    "rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-bold text-[#64748b] transition hover:border-[#bfdbfe] hover:bg-[#eff6ff] hover:text-[#2563eb]",
};

export type AppointmentStatus =
  | "Pendiente"
  | "Confirmada"
  | "En espera"
  | "En atención"
  | "Finalizada"
  | "Cancelada"
  | "No asistió";

export const appointmentStatusOptions: AppointmentStatus[] = [
  "Pendiente",
  "Confirmada",
  "En espera",
  "En atención",
  "Finalizada",
  "Cancelada",
  "No asistió",
];

export const statusStyles: Record<AppointmentStatus, string> = {
  Pendiente: "border-[#fed7aa] bg-[#fff7ed] text-[#f59e0b]",
  Confirmada: "border-[#bbf7d0] bg-[#ecfdf5] text-[#10b981]",
  "En espera": "border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb]",
  "En atención": "border-[#c7d2fe] bg-[#eef2ff] text-[#4f46e5]",
  Finalizada: "border-[#bae6fd] bg-[#f0f9ff] text-[#0284c7]",
  Cancelada: "border-[#fecaca] bg-[#fef2f2] text-[#ef4444]",
  "No asistió": "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]",
};

// ─── Listas estáticas (no conectadas a DB) ───────────────────────────────────

export const clients: never[] = [];
export const appointments: never[] = [];
export const pets: never[] = [];
export const inventory: never[] = [];

export const veterinarians = [
  {
    id: "vet-001",
    nombre: "Dra. María García",
    especialidad: "Medicina general",
    horario: "08:00 a.m. - 04:00 p.m.",
    estado: "Disponible",
    citasHoy: 0,
  },
];

export const services = [
  { id: "serv-001", nombre: "Consulta general", duracion: "30 min", veterinarioAsignable: "Sí", estado: "Activo" },
  { id: "serv-002", nombre: "Vacunación", duracion: "20 min", veterinarioAsignable: "Sí", estado: "Activo" },
  { id: "serv-003", nombre: "Desparasitación", duracion: "15 min", veterinarioAsignable: "Sí", estado: "Activo" },
  { id: "serv-004", nombre: "Control médico", duracion: "30 min", veterinarioAsignable: "Sí", estado: "Activo" },
  { id: "serv-005", nombre: "Urgencias", duracion: "Variable", veterinarioAsignable: "Sí", estado: "Activo" },
  { id: "serv-006", nombre: "Cirugía", duracion: "Según procedimiento", veterinarioAsignable: "Sí", estado: "Inactivo" },
  { id: "serv-007", nombre: "Peluquería", duracion: "60 min", veterinarioAsignable: "No", estado: "Activo" },
];

export const notifications: {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  tipo: string;
  icon: typeof Bell;
}[] = [];

export const reportStats = [
  { title: "Citas atendidas", value: "—", detail: "Durante esta semana", icon: CalendarClock },
  { title: "Citas canceladas", value: "—", detail: "Canceladas por clientes", icon: XCircle },
  { title: "Citas reprogramadas", value: "—", detail: "Cambios administrativos", icon: CalendarClock },
  { title: "Clientes nuevos", value: "—", detail: "Registrados por recepción", icon: UserRound },
  { title: "Mascotas nuevas", value: "—", detail: "Pacientes registrados", icon: PawPrint },
  { title: "No asistidas", value: "—", detail: "Citas marcadas como no asistió", icon: Clock },
];

export const dashboardStats = [
  { title: "Citas de hoy", value: "—", detail: "Cargando...", icon: CalendarCheck, iconClass: "bg-[#eff6ff] text-[#2563eb]" },
  { title: "Pendientes", value: "—", detail: "Requiere confirmación", icon: Clock, iconClass: "bg-[#fff7ed] text-[#f59e0b]" },
  { title: "En espera", value: "—", detail: "Paciente en recepción", icon: PawPrint, iconClass: "bg-[#eff6ff] text-[#2563eb]" },
  { title: "Canceladas", value: "—", detail: "Durante el día", icon: XCircle, iconClass: "bg-[#fef2f2] text-[#ef4444]" },
];

export const quickActions = [
  { label: "Crear nueva cita", description: "Agendar una consulta, vacunación o control.", href: "/recepcionista/citas", icon: CalendarCheck },
  { label: "Registrar cliente", description: "Crear o actualizar datos básicos del propietario.", href: "/recepcionista/clientes", icon: UserRound },
  { label: "Registrar mascota", description: "Asociar una mascota a un cliente existente.", href: "/recepcionista/mascotas", icon: PawPrint },
  { label: "Enviar recordatorio", description: "Notificar confirmación, cambio o cancelación.", href: "/recepcionista/notificaciones", icon: Bell },
  { label: "Consultar inventario", description: "Revisar disponibilidad y alertas de stock.", href: "/recepcionista/inventario", icon: Package },
];

export const receptionAllowedActions = [
  "Crear cita",
  "Confirmar cita",
  "Reprogramar cita",
  "Cancelar cita",
  "Cambiar estado de cita",
  "Marcar llegada como En espera",
  "Asignar veterinario",
  "Seleccionar servicio",
  "Registrar cliente",
  "Editar datos básicos del cliente",
  "Registrar mascota",
  "Editar datos básicos de la mascota",
  "Enviar recordatorio",
  "Notificar cambio o cancelación",
  "Consultar inventario básico",
  "Ver reportes básicos de recepción",
];

export const receptionBlockedActions = [
  "Crear historia clínica médica",
  "Editar diagnósticos",
  "Agregar tratamientos",
  "Crear recetas médicas",
  "Eliminar usuarios del sistema",
  "Asignar roles o permisos",
  "Eliminar veterinarios",
  "Modificar inventario completo",
  "Gestionar reportes globales administrativos",
];

export const receptionMenu = [
  "Dashboard",
  "Agenda / Citas",
  "Clientes",
  "Mascotas",
  "Veterinarios",
  "Servicios",
  "Notificaciones",
  "Inventario",
  "Reportes",
  "Configuración",
  "Cerrar sesión",
];

export const stethoscopeIcon = Stethoscope;
