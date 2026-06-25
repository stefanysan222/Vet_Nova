"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Navigation, Settings } from "lucide-react";
import { fetchClinicasActivas, type ClinicaActiva } from "../../../lib/api/clinicas";
import { useAuth } from "@/lib/auth-context";
import { haversineDistanceKm, type LatLng } from "../../../lib/utils/geo";
import ClinicsMap, { type ClinicMarker } from "../../components/maps/ClinicsMap";

function formatDistancia(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export default function ClinicasCercanasPage() {
  const { user } = useAuth();
  const [clinicas, setClinicas] = useState<ClinicaActiva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [locationStatus, setLocationStatus] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    fetchClinicasActivas()
      .then(setClinicas)
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocationStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("ok");
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const clinicasConDistancia = useMemo(() => {
    return clinicas
      .filter((c) => c.latitud != null && c.longitud != null)
      .map((c) => ({
        ...c,
        distanciaKm: userLocation
          ? haversineDistanceKm(userLocation, { lat: c.latitud!, lng: c.longitud! })
          : null,
      }))
      .sort((a, b) => (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity));
  }, [clinicas, userLocation]);

  const marcadores: ClinicMarker[] = clinicasConDistancia.map((c) => ({
    slug: c.slug,
    nombre: c.nombre,
    direccion: c.direccion,
    lat: c.latitud!,
    lng: c.longitud!,
    distanciaKm: c.distanciaKm,
  }));

  return (
    <div className="h-full overflow-y-auto bg-surface-50 px-6 py-8 dark:bg-surface-950">
      <div className="mb-8">
        <h1 className="text-page-title">Clínicas cercanas</h1>
        <p className="text-subtitle mt-2">
          Encuentra la veterinaria VetNova más cercana a tu ubicación actual.
        </p>
      </div>

      {locationStatus === "denied" && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700 dark:border-warning-800 dark:bg-warning-900/30 dark:text-warning-400">
          <Navigation className="h-4 w-4 shrink-0" />
          No pudimos acceder a tu ubicación. Activa los permisos de ubicación en tu navegador para
          ver las distancias y ordenar las clínicas por cercanía.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="admin-card h-[420px] overflow-hidden p-0 lg:h-[560px]">
          {cargando ? (
            <div className="flex h-full items-center justify-center text-sm text-surface-400">
              Cargando mapa...
            </div>
          ) : (
            <ClinicsMap clinicas={marcadores} userLocation={userLocation} />
          )}
        </div>

        <div className="space-y-3 lg:max-h-[560px] lg:overflow-y-auto lg:pr-1">
          {cargando ? (
            [1, 2, 3].map((i) => <div key={i} className="admin-card h-[88px] animate-pulse p-4" />)
          ) : clinicasConDistancia.length === 0 ? (
            <div className="admin-card p-6 text-center text-sm text-surface-500 dark:text-surface-400">
              No hay clínicas activas con ubicación registrada por ahora.
            </div>
          ) : (
            clinicasConDistancia.map((clinica) => (
              <div key={clinica.slug} className="admin-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">
                      {clinica.nombre}
                    </p>
                    {clinica.direccion && (
                      <p className="mt-1 flex items-start gap-1.5 text-xs text-surface-500 dark:text-surface-400">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {clinica.direccion}
                      </p>
                    )}
                  </div>
                  {clinica.distanciaKm != null && (
                    <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                      {formatDistancia(clinica.distanciaKm)}
                    </span>
                  )}
                </div>

                {user?.clinicaNombre === clinica.nombre ? (
                  <p className="mt-3 text-xs font-medium text-success-600 dark:text-success-400">
                    Esta es tu clínica actual
                  </p>
                ) : (
                  <Link
                    href="/cliente/configuracion"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Migrar mi cuenta aquí
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
