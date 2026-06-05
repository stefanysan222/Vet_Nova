import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-surface-200 bg-white px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xs">
          <p className="text-base font-bold text-surface-900">VetNova</p>
          <p className="mt-3 text-sm leading-6 text-surface-500">
            Sistema de gestión veterinaria para clínicas que quieren organizarse mejor sin complicarse.
          </p>
        </div>

        <div className="flex flex-wrap gap-10 text-sm">
          <div>
            <p className="font-semibold text-surface-700">Sistema</p>
            <div className="mt-3 space-y-2 text-surface-500">
              <p><Link href="/login"    className="hover:text-brand-600 transition">Iniciar sesión</Link></p>
              <p><Link href="/register" className="hover:text-brand-600 transition">Crear cuenta</Link></p>
            </div>
          </div>
          <div>
            <p className="font-semibold text-surface-700">Contacto</p>
            <div className="mt-3 space-y-2 text-surface-500">
              <p>soporte@vetnova.co</p>
              <p>+57 300 123 4567</p>
              <p>Bogotá, Colombia</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-surface-100 pt-6">
        <p className="text-xs text-surface-400">© 2026 VetNova. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
