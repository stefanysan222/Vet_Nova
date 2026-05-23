type Pet = {
  nombre: string;
  tipo: "perro" | "gato";
  especie: string;
  raza: string;
  edad: string;
  dueño: string;
  ultimaVisita: string;
  estado: string;
  estadoClass: string;
  estadoDarkClass: string;
};

const mascotas: Pet[] = [
  {
    nombre: "Max",
    tipo: "perro",
    especie: "Perro",
    raza: "Golden Retriever",
    edad: "3 años",
    dueño: "Juan Pérez",
    ultimaVisita: "15 Abr 2026",
    estado: "Activo",
    estadoClass: "bg-[#DDF5DE] text-[#008B35]",
    estadoDarkClass: "dark:bg-[#123B22] dark:text-[#86EFAC]",
  },
  {
    nombre: "Luna",
    tipo: "gato",
    especie: "Gato",
    raza: "Siamés",
    edad: "2 años",
    dueño: "María García",
    ultimaVisita: "20 Abr 2026",
    estado: "Activo",
    estadoClass: "bg-[#DDF5DE] text-[#008B35]",
    estadoDarkClass: "dark:bg-[#123B22] dark:text-[#86EFAC]",
  },
  {
    nombre: "Rocky",
    tipo: "perro",
    especie: "Perro",
    raza: "Pastor Alemán",
    edad: "5 años",
    dueño: "Carlos López",
    ultimaVisita: "02 May 2026",
    estado: "En Tratamiento",
    estadoClass: "bg-[#FBE9A9] text-[#9A6700]",
    estadoDarkClass: "dark:bg-[#4A3412] dark:text-[#FACC15]",
  },
  {
    nombre: "Bella",
    tipo: "gato",
    especie: "Gato",
    raza: "Persa",
    edad: "4 años",
    dueño: "Ana Martínez",
    ultimaVisita: "28 Abr 2026",
    estado: "Activo",
    estadoClass: "bg-[#DDF5DE] text-[#008B35]",
    estadoDarkClass: "dark:bg-[#123B22] dark:text-[#86EFAC]",
  },
  {
    nombre: "Charlie",
    tipo: "perro",
    especie: "Perro",
    raza: "Labrador",
    edad: "1 año",
    dueño: "Luis Ramírez",
    ultimaVisita: "30 Abr 2026",
    estado: "Activo",
    estadoClass: "bg-[#DDF5DE] text-[#008B35]",
    estadoDarkClass: "dark:bg-[#123B22] dark:text-[#86EFAC]",
  },
  {
    nombre: "Mia",
    tipo: "gato",
    especie: "Gato",
    raza: "Angora",
    edad: "6 meses",
    dueño: "Sofía Torres",
    ultimaVisita: "01 May 2026",
    estado: "Activo",
    estadoClass: "bg-[#DDF5DE] text-[#008B35]",
    estadoDarkClass: "dark:bg-[#123B22] dark:text-[#86EFAC]",
  },
];

export default function MascotasPage() {
  return (
    <div className="h-full overflow-y-auto bg-[#F5F7FB] px-6 py-8 dark:bg-[#0F172A]">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold leading-none text-[#10213A] dark:text-white">
            Gestión de Mascotas
          </h1>
          <p className="mt-4 text-[16px] text-[#64748B] dark:text-[#94A3B8]">
            6 mascotas registradas
          </p>
        </div>

        <button className="inline-flex h-[45px] items-center gap-2 rounded-xl bg-[#2F6BFF] px-5 text-[16px] font-semibold text-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#2457D6] hover:shadow-[0_10px_20px_rgba(47,107,255,0.28)] active:translate-y-0">
          <PlusIcon />
          Nueva Mascota
        </button>
      </div>

      {/* Search and filters */}
      <div className="mb-7 rounded-xl border border-[#CBD5E1] bg-white p-4 shadow-sm transition-all duration-300 ease-out hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:border-[#334155] dark:bg-[#111827] dark:hover:shadow-[0_10px_24px_rgba(0,0,0,0.28)]">
        <div className="flex items-center gap-3">
          <div className="flex h-[46px] flex-1 items-center gap-3 rounded-xl border border-[#CBD5E1] bg-white px-4 dark:border-[#334155] dark:bg-[#0F172A]">
            <SearchIcon />
            <input
              type="text"
              placeholder="Buscar por nombre, dueño o raza..."
              className="w-full bg-transparent text-[15px] text-[#10213A] outline-none placeholder:text-[#94A3B8] dark:text-white"
            />
          </div>

          <button className="flex h-[46px] w-[205px] items-center justify-between rounded-xl border border-[#CBD5E1] bg-white px-5 text-[15px] text-[#10213A] transition-all duration-300 ease-out hover:border-[#2F6BFF] hover:shadow-sm dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:hover:border-[#2F6BFF]">
            Todas las especies
            <ChevronDownIcon />
          </button>
        </div>
      </div>

      {/* Pet grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {mascotas.map((mascota) => (
          <article
            key={mascota.nombre}
            className="group relative min-h-[185px] rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#2F6BFF]/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF] dark:hover:shadow-[0_14px_30px_rgba(0,0,0,0.35)]"
          >
            <span
              className={`absolute right-7 top-5 rounded-full px-3 py-[5px] text-[12px] font-semibold leading-none ${mascota.estadoClass} ${mascota.estadoDarkClass}`}
            >
              {mascota.estado}
            </span>

            <div className="flex h-full gap-5">
              <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#2563EB] transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-[#2F6BFF] group-hover:text-white dark:bg-[#1E3A8A] dark:text-[#93C5FD] dark:group-hover:bg-[#2F6BFF] dark:group-hover:text-white">
                {mascota.tipo === "perro" ? <DogIcon /> : <CatIcon />}
              </div>

              <div className="min-w-0 pr-28">
                <h2 className="text-[20px] font-semibold leading-none text-[#10213A] dark:text-white">
                  {mascota.nombre}
                </h2>

                <p className="mt-5 text-[15px] leading-none text-[#52698A] dark:text-[#94A3B8]">
                  {mascota.especie} · {mascota.raza}
                </p>

                <p className="mt-3 text-[15px] leading-none text-[#52698A] dark:text-[#94A3B8]">
                  {mascota.edad}
                </p>

                <p className="mt-4 text-[15px] font-semibold leading-none text-[#10213A] dark:text-white">
                  {mascota.dueño}
                </p>

                <p className="mt-4 text-[13px] leading-none text-[#52698A] dark:text-[#94A3B8]">
                  Última visita: {mascota.ultimaVisita}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5v14M5 12h14"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <circle
        cx="11"
        cy="11"
        r="7"
        stroke="currentColor"
        strokeWidth="2"
        className="text-[#64748B] dark:text-[#94A3B8]"
      />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-[#64748B] dark:text-[#94A3B8]"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DogIcon() {
  return (
    <svg width="39" height="39" viewBox="0 0 40 40" fill="none">
      <path
        d="M13.5 19.5c-2.8 0-5 2.2-5 5v1.2c0 3 2.4 5.4 5.4 5.4h12.2c3 0 5.4-2.4 5.4-5.4v-1.2c0-2.8-2.2-5-5-5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M13.5 19.5V14c0-2 1.6-3.5 3.5-3.5h6c1.9 0 3.5 1.5 3.5 3.5v5.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M13.5 15.5 9.8 12c-1.5-1.4-4 .1-3.4 2.1l1.7 6.1"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m26.5 15.5 3.7-3.5c1.5-1.4 4 .1 3.4 2.1l-1.7 6.1"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 23.5h.1M24 23.5h.1"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M18 27c1.2 1 2.8 1 4 0"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CatIcon() {
  return (
    <svg width="39" height="39" viewBox="0 0 40 40" fill="none">
      <path
        d="M10.5 15.5V9.8c0-1.5 1.8-2.2 2.8-1.1l4 4.2"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29.5 15.5V9.8c0-1.5-1.8-2.2-2.8-1.1l-4 4.2"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 32c6.1 0 11-4.7 11-10.5S26.1 11 20 11 9 15.7 9 21.5 13.9 32 20 32Z"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M15.5 21h.1M24.5 21h.1"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M18 25.5c1.2 1 2.8 1 4 0"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}