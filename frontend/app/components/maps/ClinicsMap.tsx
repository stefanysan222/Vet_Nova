"use client";

import { useCallback, useState } from "react";
import { useJsApiLoader, GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_SCRIPT_ID,
  GOOGLE_MAPS_LIBRARIES,
} from "./google-maps-loader";
import type { LatLng } from "../../../lib/utils/geo";

const containerStyle = {
  width: "100%",
  height: "100%",
};

export interface ClinicMarker {
  slug: string;
  nombre: string;
  direccion: string | null;
  lat: number;
  lng: number;
  distanciaKm: number | null;
}

interface ClinicsMapProps {
  clinicas: ClinicMarker[];
  userLocation: LatLng | null;
  className?: string;
}

function PlaceholderBox({ message, className }: { message: string; className?: string }) {
  return (
    <div
      className={`flex aspect-[16/9] w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-500 sm:aspect-auto ${className ?? ""}`}
    >
      <span className="flex flex-col items-center gap-1.5">
        <MapPin className="h-5 w-5" />
        {message}
      </span>
    </div>
  );
}

export default function ClinicsMap({ clinicas, userLocation, className }: ClinicsMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAPS_SCRIPT_ID,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });
  const [active, setActive] = useState<ClinicMarker | null>(null);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      const bounds = new google.maps.LatLngBounds();
      clinicas.forEach((c) => bounds.extend({ lat: c.lat, lng: c.lng }));
      if (userLocation) bounds.extend(userLocation);
      if (!bounds.isEmpty()) map.fitBounds(bounds, 48);
    },
    [clinicas, userLocation],
  );

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <PlaceholderBox
        className={className}
        message="Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para habilitar el mapa."
      />
    );
  }

  if (loadError) {
    return (
      <PlaceholderBox
        className={className}
        message="No se pudo cargar Google Maps. Verifica la API key configurada."
      />
    );
  }

  if (!isLoaded) {
    return <PlaceholderBox className={className} message="Cargando mapa..." />;
  }

  const center =
    userLocation ??
    (clinicas[0] ? { lat: clinicas[0].lat, lng: clinicas[0].lng } : { lat: 4.6097, lng: -74.0817 });

  return (
    <div className={`h-full w-full overflow-hidden rounded-xl ${className ?? ""}`}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        options={{
          zoomControl: true,
          gestureHandling: "cooperative",
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {userLocation && (
          <Marker
            position={userLocation}
            title="Tu ubicación"
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#6366F1",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
            }}
          />
        )}

        {clinicas.map((clinica) => (
          <Marker
            key={clinica.slug}
            position={{ lat: clinica.lat, lng: clinica.lng }}
            title={clinica.nombre}
            onClick={() => setActive(clinica)}
          />
        ))}

        {active && (
          <InfoWindow
            position={{ lat: active.lat, lng: active.lng }}
            onCloseClick={() => setActive(null)}
          >
            <div className="max-w-[220px] text-sm">
              <p className="font-semibold text-slate-900">{active.nombre}</p>
              {active.direccion && <p className="mt-0.5 text-slate-600">{active.direccion}</p>}
              {active.distanciaKm != null && (
                <p className="mt-1 font-medium text-brand-600">
                  {active.distanciaKm < 1
                    ? `${Math.round(active.distanciaKm * 1000)} m`
                    : `${active.distanciaKm.toFixed(1)} km`}{" "}
                  de distancia
                </p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
