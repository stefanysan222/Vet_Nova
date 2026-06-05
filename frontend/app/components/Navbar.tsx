import Image from "next/image";
import Link from "next/link";
import type { NavLink } from "../types";

const NAV_LINKS: NavLink[] = [
  { label: "Inicio",    href: "#" },
  { label: "Servicios", href: "#servicios" },
  { label: "Nosotros",  href: "#nosotros" },
  { label: "Contacto",  href: "#contacto" },
] as const;

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-surface-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-12">

        <a href="#" className="inline-flex items-center gap-2.5">
          <div className="relative h-8 w-8 shrink-0">
            <Image
              src="/logos/vetnova-logo-light.png"
              alt="VetNova"
              width={32}
              height={32}
              className="block rounded-lg object-contain dark:hidden"
              priority
            />
            <Image
              src="/logos/vetnova-logo-dark.png"
              alt="VetNova"
              width={32}
              height={32}
              className="hidden rounded-lg object-contain dark:block"
              priority
            />
          </div>
          <span className="text-base font-semibold text-surface-900 dark:text-white">VetNova</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-surface-500 transition hover:text-surface-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-surface-700 transition hover:bg-surface-100"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </header>
  );
}
