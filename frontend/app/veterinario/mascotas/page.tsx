const mascotas = [
  { nombre: "Max", especie: "Canino", dueño: "Juan Pérez", estado: "Activo" },
  { nombre: "Luna", especie: "Felino", dueño: "María García", estado: "Pendiente" },
  { nombre: "Rocky", especie: "Canino", dueño: "Carlos López", estado: "En tratamiento" },
  { nombre: "Bella", especie: "Canino", dueño: "Ana Martínez", estado: "Control" },
];

export default function VeterinarioMascotasPage() {
  return (
    <div className="space-y-6">
      <header className="rounded-[24px] border border-[#CBD5E1] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:border-[#334155] dark:bg-[#111827]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#64748B] dark:text-[#94A3B8]">
          Mascotas
        </p>
        <h1 className="mt-3 text-3xl font-bold text-[#10213A] dark:text-white">
          Pacientes activos
        </h1>
        <p className="mt-3 max-w-2xl text-base text-[#64748B] dark:text-[#94A3B8]">
          Gestiona los expedientes veterinarios y revisa el estado de cada mascota registrada.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[18px] border border-[#CBD5E1] bg-white p-6 shadow-[0_6px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.12)] dark:border-[#334155] dark:bg-[#111827]">
          <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">Total de mascotas</p>
          <p className="mt-4 text-4xl font-semibold text-[#10213A] dark:text-white">248</p>
        </article>

        <article className="rounded-[18px] border border-[#CBD5E1] bg-white p-6 shadow-[0_6px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.12)] dark:border-[#334155] dark:bg-[#111827]">
          <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">En tratamiento</p>
          <p className="mt-4 text-4xl font-semibold text-[#10213A] dark:text-white">14</p>
        </article>

        <article className="rounded-[18px] border border-[#CBD5E1] bg-white p-6 shadow-[0_6px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.12)] dark:border-[#334155] dark:bg-[#111827]">
          <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">Controles hoy</p>
          <p className="mt-4 text-4xl font-semibold text-[#10213A] dark:text-white">6</p>
        </article>

        <article className="rounded-[18px] border border-[#CBD5E1] bg-white p-6 shadow-[0_6px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.12)] dark:border-[#334155] dark:bg-[#111827]">
          <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">Vacunas al día</p>
          <p className="mt-4 text-4xl font-semibold text-[#10213A] dark:text-white">182</p>
        </article>
      </div>

      <section className="rounded-[20px] border border-[#CBD5E1] bg-white p-6 shadow-[0_6px_20px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.12)] dark:border-[#334155] dark:bg-[#111827]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-semibold text-[#10213A] dark:text-white">Mascotas recientes</h2>
            <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">Revisa el estado y los detalles principales de tus pacientes más recientes.</p>
          </div>
          <span className="rounded-2xl bg-[#EEF2FF] px-3 py-2 text-sm font-semibold text-[#2F6BFF] dark:bg-[#1E293B] dark:text-[#93C5FD]">
            4 mascotas
          </span>
        </div>

        <div className="space-y-3">
          {mascotas.map((mascota) => (
            <article key={mascota.nombre} className="rounded-[18px] border border-[#E5EAF2] bg-[#F8FAFC] p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)] dark:border-[#334155] dark:bg-[#111827]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[15px] font-semibold text-[#10213A] dark:text-white">{mascota.nombre} • {mascota.especie}</p>
                  <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">Dueño: {mascota.dueño}</p>
                </div>
                <span className="rounded-full bg-[#DDEBF7] px-3 py-1.5 text-sm font-semibold text-[#1659A9] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]">
                  {mascota.estado}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
