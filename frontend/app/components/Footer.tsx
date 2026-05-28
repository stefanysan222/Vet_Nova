const STYLES = {
  footer: "border-t border-gray-200/80 bg-white/90 px-6 py-10 sm:px-8 lg:px-12",
  container: "mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between",
  brand: "text-lg font-semibold text-gray-900",
  description: "mt-3 max-w-md text-sm leading-6 text-gray-600",
  contactBlock: "space-y-2 text-sm leading-6 text-gray-600",
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

        <div className={STYLES.contactBlock}>
          <p>Contacto de prueba:</p>
          <p>soporte@vetnova.test</p>
          <p>+57 300 123 4567</p>
          <p>© 2026 VetNova. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
