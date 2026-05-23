export default function AgendarPage() {
  return (
    <div className="h-full overflow-hidden bg-[#F5F7FB] px-6 py-8 dark:bg-[#0F172A]">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold leading-none text-[#10213A] dark:text-white">
            Gestión de Citas
          </h1>
          <p className="mt-4 text-[16px] text-[#64748B] dark:text-[#94A3B8]">
            viernes, 8 de mayo de 2026
          </p>
        </div>

        <button className="inline-flex h-[45px] items-center gap-2 rounded-xl bg-[#2F6BFF] px-5 text-[16px] font-semibold text-white shadow-sm">
          <PlusIcon />
          Nueva Cita
        </button>
      </div>

      {/* Calendar controls */}
      <div className="mb-8 rounded-xl border border-[#CBD5E1] bg-white px-8 py-4 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button className="flex h-8 w-8 items-center justify-center text-[#10213A] hover:rounded-lg hover:bg-[#F1F5F9] dark:text-white dark:hover:bg-[#1E293B]">
              <ChevronLeftIcon />
            </button>

            <span className="text-[16px] font-semibold text-[#10213A] dark:text-white">
              Hoy
            </span>

            <button className="flex h-8 w-8 items-center justify-center text-[#10213A] hover:rounded-lg hover:bg-[#F1F5F9] dark:text-white dark:hover:bg-[#1E293B]">
              <ChevronRightIcon />
            </button>
          </div>

          <div className="inline-flex items-center gap-2">
            <button className="rounded-xl bg-[#2F6BFF] px-5 py-2.5 text-[16px] font-semibold text-white">
              Día
            </button>

            <button className="rounded-xl px-5 py-2.5 text-[16px] font-semibold text-[#10213A] hover:bg-[#F1F5F9] dark:text-white dark:hover:bg-[#1E293B]">
              Semana
            </button>
          </div>
        </div>
      </div>

      {/* Section title */}
      <div className="mb-5 flex items-center gap-3">
        <CalendarSectionIcon />
        <h2 className="text-[18px] font-semibold text-[#10213A] dark:text-white">
          Citas del día (0)
        </h2>
      </div>

      {/* Empty state */}
      <div className="rounded-xl border border-[#CBD5E1] bg-white px-6 py-14 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
        <div className="flex min-h-[210px] flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-[74px] w-[74px] items-center justify-center rounded-full bg-[#F1F5F9] dark:bg-[#1E293B]">
            <CalendarEmptyStateIcon />
          </div>

          <h3 className="text-[19px] font-semibold text-[#10213A] dark:text-white">
            No hay citas programadas
          </h3>

          <p className="mt-4 text-[16px] text-[#64748B] dark:text-[#94A3B8]">
            No se encontraron citas para esta fecha
          </p>

          <button className="mt-7 inline-flex h-[44px] items-center gap-2 rounded-xl bg-[#2F6BFF] px-6 text-[16px] font-semibold text-white shadow-sm">
            <PlusIcon />
            Agendar Nueva Cita
          </button>
        </div>
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

function ChevronLeftIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="m15 6-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarSectionIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="15"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="2"
        className="text-[#64748B] dark:text-[#94A3B8]"
      />
      <path
        d="M7 3.8v3.4M17 3.8v3.4M3.5 9.5h17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-[#64748B] dark:text-[#94A3B8]"
      />
    </svg>
  );
}

function CalendarEmptyStateIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="15"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="2"
        className="text-[#64748B] dark:text-[#94A3B8]"
      />
      <path
        d="M7 3.8v3.4M17 3.8v3.4M3.5 9.5h17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-[#64748B] dark:text-[#94A3B8]"
      />
    </svg>
  );
}