export default function ConfiguracionVeterinarioPage() {
  return (
    <div className="h-full overflow-y-auto bg-[#F5F7FB] px-6 py-8 dark:bg-[#0F172A]">
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold leading-none text-[#10213A] dark:text-white">
          Configuración
        </h1>
        <p className="mt-4 text-[16px] text-[#64748B] dark:text-[#94A3B8]">
          Administra tu cuenta, seguridad y preferencias del panel veterinario
        </p>
      </div>

      <div className="grid grid-cols-1 gap-7 xl:grid-cols-[1fr_0.48fr]">
        {/* Columna izquierda */}
        <div className="space-y-7">
          {/* Información personal */}
          <section className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#2F6BFF]/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF] dark:hover:shadow-[0_14px_30px_rgba(0,0,0,0.35)]">
            <div className="mb-7 flex items-center gap-3">
              <UserIcon />
              <h2 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
                Información Personal
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Nombre" defaultValue="Rodríguez" />
              <Field label="Cargo" defaultValue="Veterinario" />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Especialidad" defaultValue="Medicina general veterinaria" />
              <Field label="Registro profesional" defaultValue="VET-2026-001" />
            </div>

            <div className="mt-5">
              <Field label="Email" defaultValue="dr.rodriguez@vetnova.com" />
            </div>

            <div className="mt-5">
              <Field label="Teléfono" defaultValue="+57 300 123 4567" />
            </div>

            <div className="mt-5">
              <Field label="Horario de atención" defaultValue="Lunes a viernes · 8:00 AM - 5:00 PM" />
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button className="h-[45px] rounded-xl border border-[#CBD5E1] bg-white px-5 text-[15px] font-semibold text-[#10213A] transition-all duration-300 hover:border-[#2F6BFF] hover:bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:hover:bg-[#1E293B]">
                Cancelar
              </button>

              <button className="h-[45px] rounded-xl bg-[#2F6BFF] px-5 text-[15px] font-semibold text-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#2457D6] hover:shadow-[0_10px_20px_rgba(47,107,255,0.28)]">
                Guardar Cambios
              </button>
            </div>
          </section>

          {/* Seguridad */}
          <section className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#2F6BFF]/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF] dark:hover:shadow-[0_14px_30px_rgba(0,0,0,0.35)]">
            <div className="mb-7 flex items-center gap-3">
              <LockIcon />
              <h2 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
                Seguridad
              </h2>
            </div>

            <Field label="Contraseña Actual" defaultValue="••••••••" />

            <div className="mt-5">
              <Field label="Nueva Contraseña" defaultValue="••••••••" />
            </div>

            <div className="mt-5">
              <Field label="Confirmar Contraseña" defaultValue="••••••••" />
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button className="h-[45px] rounded-xl border border-[#CBD5E1] bg-white px-5 text-[15px] font-semibold text-[#10213A] transition-all duration-300 hover:border-[#2F6BFF] hover:bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:hover:bg-[#1E293B]">
                Cancelar
              </button>

              <button className="h-[45px] rounded-xl bg-[#2F6BFF] px-5 text-[15px] font-semibold text-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#2457D6] hover:shadow-[0_10px_20px_rgba(47,107,255,0.28)]">
                Actualizar Contraseña
              </button>
            </div>
          </section>

          {/* Notificaciones */}
          <section className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#2F6BFF]/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF] dark:hover:shadow-[0_14px_30px_rgba(0,0,0,0.35)]">
            <div className="mb-7 flex items-center gap-3">
              <BellSectionIcon />
              <h2 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
                Notificaciones
              </h2>
            </div>

            <NotificationRow
              title="Nuevas citas"
              description="Recibe alertas cuando se agenden nuevas consultas."
              enabled
            />

            <NotificationRow
              title="Recordatorios de vacunación"
              description="Alertas de vacunas próximas o vencidas."
              enabled
            />

            <NotificationRow
              title="Tratamientos activos"
              description="Seguimiento de medicamentos y controles pendientes."
              enabled
            />

            <NotificationRow
              title="Notificaciones de pago"
              description="Avisos relacionados con pagos o facturación."
              enabled={false}
              last
            />
          </section>
        </div>

        {/* Columna derecha */}
        <div className="space-y-7">
          {/* Preferencias */}
          <section className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#2F6BFF]/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF] dark:hover:shadow-[0_14px_30px_rgba(0,0,0,0.35)]">
            <div className="mb-7 flex items-center gap-3">
              <SettingsSectionIcon />
              <h2 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
                Preferencias
              </h2>
            </div>

            <SelectField label="Idioma" value="Español" />

            <div className="mt-5">
              <SelectField label="Zona Horaria" value="GMT-5 (Colombia)" />
            </div>

            <div className="mt-5">
              <SelectField label="Tema" value="Claro" />
            </div>

            <div className="mt-5">
              <SelectField label="Vista inicial" value="Dashboard" />
            </div>
          </section>

          {/* Resumen de cuenta */}
          <section className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#2F6BFF]/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF] dark:hover:shadow-[0_14px_30px_rgba(0,0,0,0.35)]">
            <h2 className="text-[18px] font-semibold text-[#10213A] dark:text-white">
              Resumen del perfil
            </h2>

            <div className="mt-6 space-y-4">
              <InfoLine label="Rol" value="Veterinario" />
              <InfoLine label="Pacientes activos" value="248" />
              <InfoLine label="Citas de hoy" value="12" />
              <InfoLine label="Consultas del mes" value="47" />
            </div>
          </section>

          {/* Zona de peligro */}
          <section className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#EF4444]/60 hover:shadow-[0_14px_30px_rgba(239,68,68,0.12)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#EF4444]">
            <h2 className="text-[18px] font-semibold text-[#10213A] dark:text-white">
              Zona de Peligro
            </h2>

            <p className="mt-4 text-[15px] text-[#64748B] dark:text-[#94A3B8]">
              Acciones irreversibles para tu cuenta veterinaria.
            </p>

            <button className="mt-6 h-[45px] w-full rounded-xl bg-[#EF4444] text-[15px] font-semibold text-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#DC2626] hover:shadow-[0_10px_20px_rgba(239,68,68,0.28)]">
              Eliminar Cuenta
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  defaultValue,
}: {
  label: string;
  defaultValue: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[15px] font-semibold text-[#10213A] dark:text-white">
        {label}
      </span>

      <input
        defaultValue={defaultValue}
        className="h-[45px] w-full rounded-lg border border-[#CBD5E1] bg-white px-4 text-[15px] text-[#10213A] outline-none transition-all duration-300 focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/10 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
      />
    </label>
  );
}

function SelectField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[15px] font-semibold text-[#10213A] dark:text-white">
        {label}
      </span>

      <div className="relative">
        <select
          defaultValue={value}
          className="h-[45px] w-full appearance-none rounded-lg border border-[#CBD5E1] bg-white px-4 pr-10 text-[15px] text-[#10213A] outline-none transition-all duration-300 focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/10 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
        >
          <option>{value}</option>
        </select>

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]">
          <ChevronDownIcon />
        </span>
      </div>
    </label>
  );
}

function NotificationRow({
  title,
  description,
  enabled,
  last = false,
}: {
  title: string;
  description: string;
  enabled: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-5 ${
        last ? "" : "border-b border-[#E2E8F0] dark:border-[#334155]"
      }`}
    >
      <div>
        <h3 className="text-[15px] font-semibold text-[#10213A] dark:text-white">
          {title}
        </h3>
        <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
          {description}
        </p>
      </div>

      <button
        className={`relative h-[24px] w-[44px] rounded-full transition ${
          enabled ? "bg-[#2F6BFF]" : "bg-[#94A3B8]"
        }`}
      >
        <span
          className={`absolute top-[2px] h-[20px] w-[20px] rounded-full bg-white shadow-sm transition ${
            enabled ? "left-[22px]" : "left-[2px]"
          }`}
        />
      </button>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 last:border-b-0 last:pb-0 dark:border-[#334155]">
      <span className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
        {label}
      </span>
      <span className="text-[15px] font-semibold text-[#10213A] dark:text-white">
        {value}
      </span>
    </div>
  );
}

/* Icons */

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M5 20c0-3.5 2.9-6 7-6s7 2.5 7 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="10"
        width="16"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellSectionIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 18H6.5c.7-.8 1.5-2.2 1.5-4.8 0-3.2 1.8-5.2 4.5-5.2s4.5 2 4.5 5.2c0 2.6.8 4 1.5 4.8H15Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 19.2a2.2 2.2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SettingsSectionIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19.4 13.2c.1-.4.1-.8.1-1.2s0-.8-.1-1.2l2-1.5-2-3.5-2.4 1a8 8 0 0 0-2-.9L14.7 3h-5.4L9 5.9c-.7.2-1.4.5-2 .9l-2.4-1-2 3.5 2 1.5A7 7 0 0 0 4.5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.5 2.4-1c.6.4 1.3.7 2 .9l.3 2.9h5.4l.3-2.9c.7-.2 1.4-.5 2-.9l2.4 1 2-3.5-2-1.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
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