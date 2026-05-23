import Link from "next/link";

export default function PerfilVeterinarioPage() {
  return (
    <div className="h-full overflow-y-auto bg-[#F5F7FB] px-6 py-8 dark:bg-[#0F172A]">
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold leading-none text-[#10213A] dark:text-white">
          Mi Perfil
        </h1>
        <p className="mt-4 text-[16px] text-[#64748B] dark:text-[#94A3B8]">
          Consulta tus datos personales y la información profesional asociada a tu cuenta.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-7 xl:grid-cols-[0.75fr_1fr]">
        <section className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#2F6BFF]/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF]">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-[92px] w-[92px] items-center justify-center rounded-full bg-[#2F6BFF] text-[36px] font-semibold text-white">
              D
            </div>

            <h2 className="mt-5 text-[24px] font-semibold text-[#10213A] dark:text-white">
              Dr. Rodríguez
            </h2>

            <p className="mt-2 text-[15px] text-[#64748B] dark:text-[#94A3B8]">
              Veterinario
            </p>

            <span className="mt-4 rounded-full bg-[#DDF5DE] px-4 py-1.5 text-[13px] font-semibold text-[#2F9E44] dark:bg-[#123B22] dark:text-[#86EFAC]">
              Perfil activo
            </span>
          </div>

          <div className="mt-8 space-y-4 border-t border-[#E2E8F0] pt-6 dark:border-[#334155]">
            <InfoRow label="Nombre completo" value="Dr. Rodríguez" />
            <InfoRow label="Rol" value="Veterinario" />
            <InfoRow label="Email" value="dr.rodriguez@vetnova.com" />
            <InfoRow label="Teléfono" value="+57 300 123 4567" />
            <InfoRow label="Especialidad" value="Medicina general veterinaria" />
            <InfoRow label="Registro profesional" value="VET-2026-001" />
            <InfoRow label="Horario" value="Lun a Vie · 8:00 AM - 5:00 PM" />
            <InfoRow label="Zona horaria" value="GMT-5 (Colombia)" />
          </div>

          <Link
            href="/veterinario/configuracion"
            className="mt-8 flex h-[45px] w-full items-center justify-center rounded-xl bg-[#2F6BFF] text-[15px] font-semibold text-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#2457D6] hover:shadow-[0_10px_20px_rgba(47,107,255,0.28)]"
          >
            Configurar perfil
          </Link>
        </section>

        <section className="space-y-7">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <ProfileStat title="Pacientes activos" value="248" />
            <ProfileStat title="Citas de hoy" value="12" />
            <ProfileStat title="Consultas del mes" value="47" />
          </div>

          <div className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#2F6BFF]/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF]">
            <h3 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
              Datos personales
            </h3>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <DataCard title="Documento" value="CC 1.234.567.890" />
              <DataCard title="Ciudad" value="Bogotá, Colombia" />
              <DataCard title="Dirección" value="Clínica VetNova Principal" />
              <DataCard title="Estado de cuenta" value="Activo" />
            </div>
          </div>

          <div className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#2F6BFF]/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF]">
            <h3 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
              Actividad reciente
            </h3>

            <div className="mt-6 space-y-5">
              <ActivityItem
                title="Última consulta registrada"
                description="Consulta general de Max · Hoy 09:00 AM"
              />

              <ActivityItem
                title="Último historial actualizado"
                description="Rocky · Cirugía menor · Actualizado recientemente"
              />

              <ActivityItem
                title="Próximo recordatorio"
                description="Vacuna de Luna · 15 May 2026"
              />
            </div>
          </div>

          <div className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#2F6BFF]/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF]">
            <h3 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
              Accesos rápidos
            </h3>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <QuickLink href="/veterinario/mascotas">
                Ver pacientes
              </QuickLink>

              <QuickLink href="/veterinario/citas">
                Ver agenda
              </QuickLink>

              <QuickLink href="/veterinario/historial">
                Historial clínico
              </QuickLink>

              <QuickLink href="/veterinario/configuracion">
                Configurar perfil
              </QuickLink>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
        {label}
      </span>

      <span className="text-right text-[14px] font-semibold text-[#10213A] dark:text-white">
        {value}
      </span>
    </div>
  );
}

function ProfileStat({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#2F6BFF]/60 hover:shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#2F6BFF]">
      <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
        {title}
      </p>

      <h3 className="mt-3 text-[26px] font-semibold text-[#10213A] dark:text-white">
        {value}
      </h3>
    </article>
  );
}

function DataCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4 transition-all duration-300 hover:border-[#2F6BFF] dark:border-[#334155] dark:bg-[#0F172A]">
      <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
        {title}
      </p>

      <p className="mt-2 text-[15px] font-semibold text-[#10213A] dark:text-white">
        {value}
      </p>
    </article>
  );
}

function ActivityItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-[#E2E8F0] pb-4 last:border-b-0 last:pb-0 dark:border-[#334155]">
      <h4 className="text-[15px] font-semibold text-[#10213A] dark:text-white">
        {title}
      </h4>

      <p className="mt-2 text-[14px] text-[#64748B] dark:text-[#94A3B8]">
        {description}
      </p>
    </div>
  );
}

function QuickLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-[#CBD5E1] bg-white px-5 py-4 text-[15px] font-semibold text-[#10213A] transition-all duration-300 hover:border-[#2F6BFF] hover:bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:hover:bg-[#1E293B]"
    >
      {children}
    </Link>
  );
}