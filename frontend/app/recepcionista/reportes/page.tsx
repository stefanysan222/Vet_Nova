import { reportStats, ui } from "../data";
import { StatCard } from "../components/StatCard";

export default function RecepcionistaReportesPage() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-black text-[#1e293b]">
          Reportes básicos de recepción
        </h2>
        <p className="text-sm font-medium text-[#64748b]">
          Resumen operativo. Esta vista no incluye reportes globales ni financieros.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reportStats.map((item) => (
          <StatCard
            key={item.title}
            {...item}
            iconClass="bg-[#eff6ff] text-[#2563eb]"
          />
        ))}
      </section>

      <section className={`${ui.card} p-5`}>
        <h3 className="text-xl font-black text-[#1e293b]">
          Alcance del rol recepcionista
        </h3>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-[#64748b]">
          La recepcionista puede consultar indicadores básicos de citas,
          clientes y mascotas registrados. No puede gestionar reportes globales,
          diagnósticos, tratamientos, recetas, roles, permisos ni inventario completo.
        </p>
      </section>
    </div>
  );
}
