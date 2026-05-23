"use client";

import React from "react";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";

export default function ConfiguracionPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar />
        <div className="lg:order-2">
          <Navbar />
          <main className="mx-auto max-w-7xl px-6 pb-12 pt-6 lg:px-10">
            <section className="rounded-[2rem] border border-slate-200/60 bg-white/95 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)]">
              <h1 className="text-3xl font-semibold">Configuración</h1>
              <p className="mt-2 text-sm text-slate-600">Ajustes generales de la plataforma y preferencias del usuario.</p>

              <div className="mt-6 grid gap-6">
                <div className="rounded-lg border p-4">
                  <h2 className="font-semibold">Perfil de Usuario</h2>
                  <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
                    <li>Cambiar nombre de usuario</li>
                    <li>Cambiar foto de perfil</li>
                    <li>Actualizar correo electrónico</li>
                    <li>Cambiar contraseña</li>
                  </ul>
                </div>

                <div className="rounded-lg border p-4">
                  <h2 className="font-semibold">Preferencias de la Aplicación</h2>
                  <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
                    <li>Cambiar idioma</li>
                    <li>Selección de tema (modo oscuro / claro)</li>
                    <li>Configuración de notificaciones</li>
                    <li>Habilitar/Deshabilitar notificaciones por correo</li>
                    <li>Ajustar notificaciones en la aplicación</li>
                    <li>Personalización de la interfaz (colores, disposición)</li>
                  </ul>
                </div>

                <div className="rounded-lg border p-4">
                  <h2 className="font-semibold">Seguridad y Privacidad</h2>
                  <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
                    <li>Configuración de autenticación de dos factores</li>
                    <li>Monitoreo de actividad</li>
                    <li>Ver historial de inicios de sesión</li>
                    <li>Establecer preguntas de seguridad</li>
                  </ul>
                </div>

                <div className="rounded-lg border p-4">
                  <h2 className="font-semibold">Integraciones</h2>
                  <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
                    <li>Conectar con servicios externos</li>
                    <li>Configurar API keys</li>
                    <li>Administrar aplicaciones conectadas</li>
                  </ul>
                </div>

                <div className="rounded-lg border p-4">
                  <h2 className="font-semibold">Facturación y Suscripciones</h2>
                  <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
                    <li>Ver detalles de facturación</li>
                    <li>Cambiar plan de suscripción</li>
                    <li>Agregar o eliminar métodos de pago</li>
                    <li>Ver historial de pagos y suscripciones</li>
                  </ul>
                </div>

                <div className="rounded-lg border p-4">
                  <h2 className="font-semibold">Ajustes de Acceso</h2>
                  <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
                    <li>Administrar permisos de usuarios</li>
                    <li>Controlar accesos por roles</li>
                    <li>Establecer políticas de acceso</li>
                  </ul>
                </div>

                <div className="rounded-lg border p-4">
                  <h2 className="font-semibold">Ajustes de API</h2>
                  <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
                    <li>Ver claves API activas</li>
                    <li>Configurar permisos de acceso a la API</li>
                    <li>Ajustes avanzados de la API</li>
                  </ul>
                </div>

                <div className="rounded-lg border p-4">
                  <h2 className="font-semibold">Soporte y Ayuda</h2>
                  <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
                    <li>Acceder a la documentación de la aplicación</li>
                    <li>Contactar con soporte</li>
                    <li>Ver tutoriales y guías</li>
                    <li>Reportar un problema</li>
                  </ul>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
