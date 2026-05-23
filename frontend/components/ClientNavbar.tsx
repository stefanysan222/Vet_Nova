"use client";

import { Search, Bell, Settings } from "lucide-react";

export default function ClientNavbar() {
  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <div className="hidden flex-1 lg:flex">
          <div className="flex w-full max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search size={20} className="text-slate-400" />
            <input
              type="text"
              placeholder="Buscar mascotas, citas..."
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100">
            <Bell size={20} className="text-slate-600" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <button className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100">
            <Settings size={20} className="text-slate-600" />
          </button>

          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
              <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                JC
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">Juan Carlos</p>
              <p className="text-xs text-slate-500">Cliente</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
