import { COMMON_STYLES } from "../constants";
import type { Stat } from "../types";

// Constants
const STATS: Stat[] = [
  {
    amount: "+1200",
    label: "clientes",
    description: "Clínicas y mascotas confían en VetNova.",
  },
  {
    amount: "+2500",
    label: "mascotas atendidas",
    description: "Atención eficiente y cuidado integral.",
  },
  {
    amount: "+15",
    label: "veterinarios expertos",
    description: "Equipo especializado y en crecimiento.",
  },
  {
    amount: "+98%",
    label: "satisfacción",
    description: "Clientes satisfechos con el servicio y seguimiento.",
  },
] as const;

const STYLES = {
  section: COMMON_STYLES.section,
  container: "mx-auto max-w-6xl rounded-[2.5rem] bg-blue-600 px-6 py-10 text-white shadow-xl shadow-blue-600/20 sm:px-12 lg:px-12",
  grid: "grid gap-6 sm:grid-cols-2 xl:grid-cols-4",
  statCard: "rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:bg-white/10",
  statAmount: "text-4xl font-semibold tracking-tight text-blue-100",
  statLabel: "mt-3 text-sm uppercase tracking-[0.3em] text-blue-100",
  statDescription: "mt-4 text-sm leading-6 text-blue-50",
} as const;

export default function Stats() {
  return (
    <section className={STYLES.section}>
      <div className={STYLES.container}>
        <div className={STYLES.grid}>
          {STATS.map((stat) => (
            <div key={stat.label} className={STYLES.statCard}>
              <p className={STYLES.statAmount}>{stat.amount}</p>
              <p className={STYLES.statLabel}>{stat.label}</p>
              <p className={STYLES.statDescription}>{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
