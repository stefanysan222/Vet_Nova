import { Instagram, Linkedin, Twitter } from "lucide-react";
import type { SocialLink } from "../types";

// Constants
const SOCIAL_LINKS: SocialLink[] = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
] as const;

const STYLES = {
  footer: "border-t border-gray-200/80 bg-white/90 px-6 py-10 sm:px-8 lg:px-12",
  container: "mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between",
  brand: "text-lg font-semibold text-gray-900",
  description: "mt-3 max-w-md text-sm leading-6 text-gray-600",
  socialContainer: "flex items-center gap-4 text-gray-600",
  socialLink: "transition hover:text-blue-600",
  copyright: "text-sm text-gray-500",
} as const;

export default function Footer() {
  return (
    <footer className={STYLES.footer}>
      <div className={STYLES.container}>
        <div>
          <p className={STYLES.brand}>VetNova</p>
          <p className={STYLES.description}>
            Software de gestión veterinaria para clínicas modernas que buscan optimizar su operación y mejorar la experiencia de los pacientes.
          </p>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className={STYLES.socialContainer}>
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} className={STYLES.socialLink}>
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
          <p className={STYLES.copyright}>© 2026 VetNova. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
