import { BarChart3, Box, CalendarCheck, ClipboardList } from "lucide-react";
import { COMMON_STYLES } from "../constants";
import type { Service } from "../types";

// Constants
const SERVICES: Service[] = [
  {
    title: "Gestión de citas",
    description: "Agenda y organiza consultas con recordatorios inteligentes.",
    icon: CalendarCheck,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Historia clínica",
    description: "Registra consultas, vacunas y datos médicos con total trazabilidad.",
    icon: ClipboardList,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Inventario",
    description: "Controla medicamentos y productos con alertas de stock.",
    icon: Box,
    color: "bg-gray-100 text-gray-700",
  },
  {
    title: "Reportes y estadísticas",
    description: "Visualiza métricas de atención, ingresos y satisfacción.",
    icon: BarChart3,
    color: "bg-gray-50 text-gray-600",
  },
] as const;

const STYLES = {
  section: COMMON_STYLES.section,
  container: COMMON_STYLES.container,
  header: "mb-10 max-w-2xl",
  sectionTitle: COMMON_STYLES.text.caption,
  sectionHeading: COMMON_STYLES.text.heading,
  grid: "grid gap-6 md:grid-cols-2 xl:grid-cols-4",
  card: "group overflow-hidden rounded-[2rem] border border-gray-200/80 bg-white p-7 shadow-lg shadow-gray-200/50 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-2xl hover:shadow-gray-200/40",
  iconContainer: "inline-flex h-14 w-14 items-center justify-center rounded-3xl",
  cardTitle: COMMON_STYLES.text.subheading,
  cardDescription: COMMON_STYLES.text.body,
} as const;

export default function Services() {
  return (
    <section id="servicios" className={STYLES.section}>
      <div className={STYLES.container}>
        <div className={STYLES.header}>
          <p className={STYLES.sectionTitle}>Servicios</p>
          <h2 className={STYLES.sectionHeading}>
            Todo lo que necesitas para gestionar tu clínica en una sola plataforma.
          </h2>
        </div>

        <div className={STYLES.grid}>
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <article key={service.title} className={STYLES.card}>
                <div className={`${STYLES.iconContainer} ${service.color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className={STYLES.cardTitle}>{service.title}</h3>
                <p className={STYLES.cardDescription}>{service.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
