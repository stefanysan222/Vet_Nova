import Link from "next/link";

export default function PerfilPage() {
  return (
    <div className="h-full overflow-y-auto bg-[#F5F7FB] px-6 py-8 dark:bg-[#0F172A]">
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold leading-none text-[#10213A] dark:text-white">
          Mi Perfil
        </h1>
        <p className="mt-4 text-[16px] text-[#64748B] dark:text-[#94A3B8]">
          Vista general de tu cuenta en VetNova
        </p>
      </div>

      <div className="grid grid-cols-1 gap-7 xl:grid-cols-[0.75fr_1fr]">
        <section className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-[92px] w-[92px] items-center justify-center rounded-full bg-[#2F6BFF] text-[36px] font-semibold text-white">
              J
            </div>

            <h2 className="mt-5 text-[24px] font-semibold text-[#10213A] dark:text-white">
              Juan Pérez
            </h2>

            <p className="mt-2 text-[15px] text-[#64748B] dark:text-[#94A3B8]">
              Cliente
            </p>

            <span className="mt-4 rounded-full bg-[#DDF5DE] px-4 py-1.5 text-[13px] font-semibold text-[#2F9E44]">
              Cuenta activa
            </span>
          </div>

          <div className="mt-8 space-y-4 border-t border-[#E2E8F0] pt-6 dark:border-[#334155]">
            <InfoRow label="Email" value="usuario@vetnova.com" />
            <InfoRow label="Teléfono" value="+52 555 1234 5678" />
            <InfoRow label="Ubicación" value="Ciudad de México" />
            <InfoRow label="Miembro desde" value="Abril 2026" />
          </div>

          <Link
            href="/cliente/configuracion"
            className="mt-8 flex h-[45px] w-full items-center justify-center rounded-xl bg-[#2F6BFF] text-[15px] font-semibold text-white shadow-sm"
          >
            Configuración del perfil
          </Link>
        </section>

        <section className="space-y-7">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <ProfileStat title="Mascotas" value="6" />
            <ProfileStat title="Citas activas" value="2" />
            <ProfileStat title="Notificaciones" value="3" />
          </div>

          <div className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
            <h3 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
              Resumen de actividad
            </h3>

            <div className="mt-6 space-y-5">
              <ActivityItem
                title="Última cita registrada"
                description="Consulta general de Max · 09:00 AM"
              />
              <ActivityItem
                title="Mascota más reciente"
                description="Mia · Gato Angora · Registrada el 01 May 2026"
              />
              <ActivityItem
                title="Última notificación"
                description="Recordatorio de vacunación pendiente para Luna"
              />
            </div>
          </div>

          <div className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
            <h3 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
              Accesos rápidos
            </h3>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <QuickLink href="/cliente/mascotas">Ver mis mascotas</QuickLink>
              <QuickLink href="/cliente/agendar">Ver mis citas</QuickLink>
              <QuickLink href="/cliente/notificaciones">
                Ver notificaciones
              </QuickLink>
              <QuickLink href="/cliente/configuracion">
                Editar configuración
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
    <article className="rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
      <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
        {title}
      </p>
      <h3 className="mt-3 text-[26px] font-semibold text-[#10213A] dark:text-white">
        {value}
      </h3>
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
      className="rounded-xl border border-[#CBD5E1] bg-white px-5 py-4 text-[15px] font-semibold text-[#10213A] hover:bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:hover:bg-[#1E293B]"
    >
      {children}
    </Link>
  );
}