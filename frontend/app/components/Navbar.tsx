import Image from "next/image";
import Button from "./Button";
import type { NavLink } from "../types";

// Constants
const NAV_LINKS: NavLink[] = [
  { label: "Inicio", href: "#" },
  { label: "Servicios", href: "#servicios" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contacto", href: "#contacto" },
] as const;

const STYLES = {
  header: "fixed inset-x-0 top-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur-xl",
  container: "mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-12",
  logoLink: "inline-flex items-center gap-2 font-semibold text-blue-600",
  logoContainer: "h-12 w-12 rounded-2xl bg-blue-100 p-2 shadow-sm",
  logoImage: "h-full w-full rounded-lg object-cover",
  logoText: "text-lg",
  nav: "hidden items-center gap-8 md:flex",
  navLink: "text-sm font-medium text-gray-600 transition hover:text-blue-600",
} as const;

export default function Navbar() {
  return (
    <header className={STYLES.header}>
      <div className={STYLES.container}>
        <a href="#" className={STYLES.logoLink}>
          <div className={STYLES.logoContainer}>
            <Image
              src="/logos/vetnova-logo-light.png"
              alt="VetNova logo"
              width={40}
              height={40}
              className={STYLES.logoImage}
              priority
            />
          </div>
          <span className={STYLES.logoText}>VetNova</span>
        </a>

        <nav className={STYLES.nav}>
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className={STYLES.navLink}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button href="/login" className="rounded-full px-5 py-2.5 text-sm font-semibold" >
            Iniciar sesión
          </Button>
          <Button href="/register" variant="secondary" className="rounded-full px-5 py-2.5 text-sm font-semibold">
            Registrarse
          </Button>
        </div>
      </div>
    </header>
  );
}
