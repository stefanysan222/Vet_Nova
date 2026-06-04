
"use client";
import { useState, useEffect } from "react";

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  const user = { name: "Recepción", role: "Turno activo" };

  return (
    <div className="relative ml-4">
      <button
        className="flex items-center gap-2 p-2 rounded hover:bg-gray-100"
        onClick={() => setOpen(!open)}
      >
        <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center text-white">
          {user.name.charAt(0)}
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-[#1e293b]">{user.name}</p>
          <p className="text-xs text-[#64748b]">{user.role}</p>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border border-[#e2e8f0] z-50">
          <button className="block w-full p-2 text-left text-sm hover:bg-gray-100">
            Ver perfil
          </button>
          <div className="flex items-center justify-between px-2 py-2">
            <span className="text-sm text-[#1e293b]">Modo oscuro</span>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              className="toggle-checkbox"
            />
          </div>
        </div>
      )}
    </div>
  );
}