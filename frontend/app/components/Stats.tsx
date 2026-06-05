const RAZONES = [
  {
    titulo: "Un sistema, tres roles",
    texto: "Administrador, veterinario y cliente tienen vistas y permisos ajustados a lo que necesitan, sin acceso a lo que no corresponde.",
  },
  {
    titulo: "Datos reales, no estimaciones",
    texto: "Citas, mascotas y usuarios se obtienen directamente de la base de datos. Ningún número es inventado.",
  },
  {
    titulo: "Acceso desde cualquier lugar",
    texto: "Sistema web responsivo que funciona en computador, tablet o celular, sin instalar nada.",
  },
  {
    titulo: "Diseñado para crecer",
    texto: "La arquitectura soporta agregar funcionalidades sin reescribir lo que ya funciona.",
  },
] as const;

export default function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-600 to-brand-700">
        <div className="px-8 py-10 sm:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-200">
            Por qué VetNova
          </p>
          <h2 className="mt-3 max-w-xl text-2xl font-bold text-white sm:text-3xl">
            Construido con claridad. Sin funciones de relleno.
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {RAZONES.map(({ titulo, texto }) => (
              <div
                key={titulo}
                className="rounded-xl border border-white/10 bg-white/8 p-5 backdrop-blur-sm"
              >
                <p className="text-sm font-semibold text-white">{titulo}</p>
                <p className="mt-2 text-sm leading-6 text-brand-100">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
