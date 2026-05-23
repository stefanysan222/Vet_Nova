import Image from "next/image";
import Link from "next/link";

const navigation = [
  { label: "Dashboard", href: "/", active: true },
  { label: "Citas", href: "/citas", active: false },
  { label: "Mascotas", href: "/mascotas", active: false },
  { label: "Configuración", href: "/configuracion", active: false },
];

export default function Sidebar() {
  return (
    <aside className="flex h-full w-full max-w-[280px] flex-col gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 text-2xl font-bold text-slate-900">
        <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-slate-100">
          <Image
            src="/Vetnova_logo.jpeg"
            alt="VetNova logo"
            fill
            sizes="48px"
            className="object-contain"
          />
        </div>
        VetNova
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {navigation.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
              item.active
                ? "bg-blue-50 text-blue-700 shadow"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <button className="mt-auto inline-flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
        Cerrar sesión
      </button>
    </aside>
  );
}
