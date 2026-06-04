"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import { getCurrentUser } from "../../../lib/auth";

interface AdminSettings {
  username: string;
  email: string;
  language: string;
  theme: "light" | "dark";
  notificationsEmail: boolean;
  notificationsApp: boolean;
}

export default function ConfiguracionPage() {
  const [settings, setSettings] = useState<AdminSettings>({
    username: "",
    email: "",
    language: "Español",
    theme: "dark",
    notificationsEmail: true,
    notificationsApp: true,
  });
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setSettings((prev) => ({
        ...prev,
        username: user.name,
        email: user.email,
      }));
    }
  }, []);

  const handleChange = (field: keyof AdminSettings, value: string | boolean) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const saveSettings = () => {
    setSavedMessage("Configuración guardada correctamente.");
    window.setTimeout(() => setSavedMessage(""), 3000);
  };

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
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">Configuración</p>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Ajustes de la plataforma</h1>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
                    Administra el perfil, preferencias de idioma, tema y notificaciones desde el panel.
                  </p>
                </div>
                <button
                  onClick={saveSettings}
                  className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(37,99,235,0.22)] transition duration-300 hover:bg-blue-700"
                >
                  Guardar cambios
                </button>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6 rounded-[2rem] border border-slate-200/70 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Perfil de administrador</h2>
                    <div className="mt-6 grid gap-4">
                      <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        <span>Nombre de usuario</span>
                        <input
                          type="text"
                          value={settings.username}
                          onChange={(event) => handleChange("username", event.target.value)}
                          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        <span>Correo electrónico</span>
                        <input
                          type="email"
                          value={settings.email}
                          onChange={(event) => handleChange("email", event.target.value)}
                          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Preferencias de la app</h2>
                    <div className="mt-6 grid gap-4">
                      <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        <span>Idioma</span>
                        <select
                          value={settings.language}
                          onChange={(event) => handleChange("language", event.target.value)}
                          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        >
                          <option>Español</option>
                          <option>Inglés</option>
                        </select>
                      </label>
                      <label className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                        <span>Tema oscuro</span>
                        <input
                          type="checkbox"
                          checked={settings.theme === "dark"}
                          onChange={(event) => handleChange("theme", event.target.checked ? "dark" : "light")}
                          className="h-5 w-5 rounded border-slate-300 text-blue-600"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Notificaciones</h2>
                    <div className="mt-6 space-y-4">
                      <label className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                        <span>Correo electrónico</span>
                        <input
                          type="checkbox"
                          checked={settings.notificationsEmail}
                          onChange={(event) => handleChange("notificationsEmail", event.target.checked)}
                          className="h-5 w-5 rounded border-slate-300 text-blue-600"
                        />
                      </label>
                      <label className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                        <span>En la aplicación</span>
                        <input
                          type="checkbox"
                          checked={settings.notificationsApp}
                          onChange={(event) => handleChange("notificationsApp", event.target.checked)}
                          className="h-5 w-5 rounded border-slate-300 text-blue-600"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <aside className="rounded-[2rem] border border-slate-200/70 bg-slate-50 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Configuración rápida</h2>
                  <p className="mt-3">Aquí puedes ajustar los elementos más importantes del panel administrador.</p>

                  <div className="mt-6 space-y-4">
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Tema actual</p>
                      <p className="mt-1">{settings.theme === "dark" ? "Oscuro" : "Claro"}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Idioma</p>
                      <p className="mt-1">{settings.language}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Notificaciones por correo</p>
                      <p className="mt-1">{settings.notificationsEmail ? "Activadas" : "Desactivadas"}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Notificaciones en la app</p>
                      <p className="mt-1">{settings.notificationsApp ? "Activadas" : "Desactivadas"}</p>
                    </div>
                  </div>
                </aside>
              </div>

              {savedMessage ? (
                <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                  {savedMessage}
                </div>
              ) : null}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
