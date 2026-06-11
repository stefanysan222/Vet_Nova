import { CalendarCheck, ClipboardList, Users, BarChart3 } from "lucide-react";

const SERVICES = [
  {
    icon: CalendarCheck,
    title: "Agenda inteligente",
    description:
      "Los clientes solicitan citas desde su cuenta. El administrador las confirma. Sin llamadas, sin confusiones.",
    accent: "bg-brand-50 text-brand-600",
    border: "hover:border-brand-200",
  },
  {
    icon: ClipboardList,
    title: "Historia clínica",
    description:
      "Registra consultas, diagnósticos, vacunas y tratamientos. Todo queda guardado y accesible para el veterinario.",
    accent: "bg-success-50 text-success-600",
    border: "hover:border-success-200",
  },
  {
    icon: Users,
    title: "Gestión de pacientes",
    description:
      "Cada mascota tiene su perfil completo: especie, raza, edad, peso, alergias y su propietario vinculado.",
    accent: "bg-amber-50 text-amber-600",
    border: "hover:border-amber-200",
  },
  {
    icon: BarChart3,
    title: "Reportes y control",
    description:
      "Estadísticas de citas, usuarios activos y actividad del sistema, disponibles para el administrador en tiempo real.",
    accent: "bg-surface-100 text-surface-600",
    border: "hover:border-surface-300",
  },
] as const;

export default function Services() {
  return (
    <section id="servicios" className="mx-auto max-w-6xl px-5 py-20 sm:px-6 lg:px-8">
      <div className="mb-12 max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-600">
          Módulos del sistema
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
          Todo lo que necesita una clínica veterinaria moderna.
        </h2>
        <p className="mt-4 text-base leading-7 text-surface-500">
          Cada módulo está diseñado para un rol específico: el administrador gestiona, el
          veterinario atiende y el cliente hace seguimiento.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map(({ icon: Icon, title, description, accent, border }) => (
          <article
            key={title}
            className={`group rounded-2xl border border-surface-200 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover ${border}`}
          >
            <div
              className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-surface-900">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-surface-500">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
