import { MagnifyingGlassIcon, BellIcon } from "./icons";

export default function Header() {
  return (
    <header className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-inner sm:max-w-xl">
        <MagnifyingGlassIcon />
        <input
          type="search"
          placeholder="Buscar mascotas, citas..."
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200">
          <BellIcon />
        </button>
        <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white">
            JP
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-900">Juan Pérez</p>
            <p className="text-xs text-slate-500">Cliente</p>
          </div>
        </div>
      </div>
    </header>
  );
}
