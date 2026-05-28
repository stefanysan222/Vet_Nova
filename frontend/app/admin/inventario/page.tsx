import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";

export default function InventarioPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar />
        <div className="lg:order-2">
          <Navbar />
          <main className="mx-auto max-w-7xl px-6 pb-12 pt-6 lg:px-10">
            <section className="rounded-[2rem] border border-slate-200/60 bg-white/95 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-950">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">Inventario</p>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Inventario</h1>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
                    Controla el stock de productos, alimentos y medicamentos, con alertas de reposición.
                  </p>
                </div>
                <button className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(37,99,235,0.22)] transition duration-300 hover:bg-blue-700">
                  Actualizar stock
                </button>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Productos críticos</h2>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Mira qué insumos necesitan reposición urgente.</p>
                </div>
                <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Movimientos recientes</h2>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Registra las entradas y salidas del inventario.</p>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
