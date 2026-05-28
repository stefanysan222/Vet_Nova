import Image from "next/image";
import { ArrowRight, Sparkles, Layers } from "lucide-react";
import Button from "./Button";

// Constants
const HIGHLIGHTS = [
  "Citas inteligentes",
  "Historia clínica digital",
  "Inventario automático",
  "Reportes en tiempo real",
] as const;

const STYLES = {
  section: "relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-50 via-white to-gray-50 px-6 py-16 shadow-xl shadow-gray-200/40 sm:px-10 lg:px-14",
  badge: "inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-gray-200/70",
  title: "max-w-3xl text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl",
  description: "max-w-2xl text-base leading-8 text-gray-600 sm:text-lg",
  highlightCard: "flex items-center gap-3 rounded-3xl border border-gray-200 bg-white/90 px-4 py-3 shadow-sm shadow-gray-200/50",
  iconContainer: "flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600",
  dashboardPanel: "relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 p-8 shadow-xl shadow-gray-200/50 backdrop-blur-xl",
  dashboardHeader: "flex items-center justify-between rounded-3xl bg-gray-900/95 p-5 text-white shadow-lg shadow-gray-900/10",
  logoContainer: "h-11 w-11 rounded-2xl bg-blue-200 p-1",
  logoImage: "h-full w-full rounded-lg object-cover",
  badgeSaaS: "rounded-3xl bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-900",
  metricCard: "rounded-3xl bg-gray-50 p-5 shadow-sm shadow-gray-200/50",
  metricLabel: "text-sm text-gray-500",
  metricValue: "mt-2 text-3xl font-semibold text-gray-900",
  activePetsCard: "rounded-3xl bg-blue-50 p-5 text-gray-900",
  satisfactionCard: "rounded-3xl bg-gray-100 p-5 text-gray-900",
  aboutSection: "mt-16 rounded-[2rem] border border-gray-200/70 bg-white/90 px-6 py-8 shadow-sm shadow-gray-200/50 sm:px-8",
  aboutTitle: "text-sm uppercase tracking-[0.3em] text-blue-600",
  aboutHeading: "mt-3 text-2xl font-semibold text-gray-900",
  aboutText: "max-w-xl text-gray-600 sm:text-right",
} as const;

export default function Hero() {
  return (
    <section className={STYLES.section}>
      <div className="pointer-events-none absolute -right-24 top-8 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="pointer-events-none absolute left-0 top-20 h-72 w-72 rounded-full bg-gray-200/70 blur-3xl" />

      <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <span className={STYLES.badge}>
            <Sparkles className="h-4 w-4 text-blue-600" />
            Software SaaS para veterinarias
          </span>

          <h1 className={STYLES.title}>
            Cuidado que merecen, tecnología que conecta
          </h1>

          <p className={STYLES.description}>
            Sistema integral para la gestión veterinaria. Citas, historia clínica, pacientes y más en un solo lugar.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button href="/login" icon={ArrowRight}>
              Iniciar sesión
            </Button>
            <Button href="/register" variant="secondary">
              Registrarse
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {HIGHLIGHTS.map((item) => (
              <div key={item} className={STYLES.highlightCard}>
                <span className={STYLES.iconContainer}>
                  <Layers className="h-5 w-5" />
                </span>
                <p className="text-sm font-medium text-gray-800">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={STYLES.dashboardPanel}>
          <div className={STYLES.dashboardHeader}>
            <div className="flex items-center gap-3">
              <div className={STYLES.logoContainer}>
                <Image
                  src="/logos/vetnova-logo-light.png"
                  alt="VetNova logo"
                  width={40}
                  height={40}
                  className={STYLES.logoImage}
                />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-300">VetNova</p>
                <h2 className="mt-2 text-lg font-semibold">Panel administrativo</h2>
              </div>
            </div>
            <div className={STYLES.badgeSaaS}>SaaS</div>
          </div>

          <div className="mt-8 grid gap-4">
            <div className={STYLES.metricCard}>
              <p className={STYLES.metricLabel}>Citas del día</p>
              <p className={STYLES.metricValue}>18</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className={STYLES.activePetsCard}>
                <p className="text-sm font-semibold">Mascotas activas</p>
                <p className="mt-3 text-2xl font-semibold">320</p>
              </div>
              <div className={STYLES.satisfactionCard}>
                <p className="text-sm font-semibold">Satisfacción</p>
                <p className="mt-3 text-2xl font-semibold">98%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="nosotros" className={STYLES.aboutSection}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={STYLES.aboutTitle}>Nosotros</p>
            <h3 className={STYLES.aboutHeading}>Tecnología amable para el cuidado veterinario.</h3>
          </div>

        </div>
      </div>
    </section>
  );
}
