export default function ConfiguracionPage() {
  return (
    <div className="h-full overflow-y-auto bg-[#F5F7FB] px-6 py-8 dark:bg-[#0F172A]">
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold leading-none text-[#10213A] dark:text-white">
          Configuración
        </h1>
        <p className="mt-4 text-[16px] text-[#64748B] dark:text-[#94A3B8]">
          Administra tu cuenta y preferencias
        </p>
      </div>

      <div className="grid grid-cols-1 gap-7 xl:grid-cols-[1fr_0.48fr]">
        <div className="space-y-7">
          <section className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
            <div className="mb-7 flex items-center gap-3">
              <UserIcon />
              <h2 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
                Información Personal
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Nombre" defaultValue="Juan" />
              <Field label="Apellido" defaultValue="Pérez" />
            </div>

            <div className="mt-5">
              <Field label="Email" defaultValue="usuario@vetnova.com" />
            </div>

            <div className="mt-5">
              <Field label="Teléfono" defaultValue="+52 555 1234 5678" />
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button className="h-[45px] rounded-xl border border-[#CBD5E1] bg-white px-5 text-[15px] font-semibold text-[#10213A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white">
                Cancelar
              </button>

              <button className="h-[45px] rounded-xl bg-[#2F6BFF] px-5 text-[15px] font-semibold text-white shadow-sm">
                Guardar Cambios
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
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
              <button className="h-[45px] rounded-xl border border-[#CBD5E1] bg-white px-5 text-[15px] font-semibold text-[#10213A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white">
                Cancelar
              </button>

              <button className="h-[45px] rounded-xl bg-[#2F6BFF] px-5 text-[15px] font-semibold text-white shadow-sm">
                Actualizar Contraseña
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-7">
          <section className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
            <div className="mb-7 flex items-center gap-3">
              <SettingsIcon />
              <h2 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
                Preferencias
              </h2>
            </div>

            <SelectField label="Idioma" value="Español" />
            <div className="mt-5">
              <SelectField label="Zona Horaria" value="GMT-6 (Ciudad de México)" />
            </div>
            <div className="mt-5">
              <SelectField label="Tema" value="Claro" />
            </div>
          </section>

          <section className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
            <h2 className="text-[18px] font-semibold text-[#10213A] dark:text-white">
              Zona de Peligro
            </h2>

            <p className="mt-4 text-[15px] text-[#64748B] dark:text-[#94A3B8]">
              Acciones irreversibles para tu cuenta
            </p>

            <button className="mt-6 h-[45px] w-full rounded-xl bg-[#EF4444] text-[15px] font-semibold text-white shadow-sm">
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
        className="h-[45px] w-full rounded-lg border border-[#CBD5E1] bg-white px-4 text-[15px] text-[#10213A] outline-none focus:border-[#2F6BFF] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
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

      <select
        defaultValue={value}
        className="h-[45px] w-full rounded-lg border border-[#CBD5E1] bg-white px-4 text-[15px] text-[#10213A] outline-none focus:border-[#2F6BFF] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
      >
        <option>{value}</option>
      </select>
    </label>
  );
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
      <path d="M5 20c0-3.5 2.9-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" stroke="currentColor" strokeWidth="2" />
      <path d="M19.4 13.2c.1-.4.1-.8.1-1.2s0-.8-.1-1.2l2-1.5-2-3.5-2.4 1a8 8 0 0 0-2-.9L14.7 3h-5.4L9 5.9c-.7.2-1.4.5-2 .9l-2.4-1-2 3.5 2 1.5A7 7 0 0 0 4.5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.5 2.4-1c.6.4 1.3.7 2 .9l.3 2.9h5.4l.3-2.9c.7-.2 1.4-.5 2-.9l2.4 1 2-3.5-2-1.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}