"use client";

import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_SCRIPT_ID,
  GOOGLE_MAPS_LIBRARIES,
} from "./google-maps-loader";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "12px",
};

interface MapPreviewProps {
  lat?: number | null;
  lng?: number | null;
  className?: string;
}

function PlaceholderBox({ message, className }: { message: string; className?: string }) {
  return (
    <div
      className={`flex aspect-[16/9] w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-500 sm:aspect-[2/1] ${className ?? ""}`}
    >
      <span className="flex flex-col items-center gap-1.5">
        <MapPin className="h-5 w-5" />
        {message}
      </span>
    </div>
  );
}

export default function MapPreview({ lat, lng, className }: MapPreviewProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAPS_SCRIPT_ID,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

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

  if (lat == null || lng == null) {
    return (
      <PlaceholderBox className={className} message="Selecciona una dirección para ver el mapa." />
    );
  }

  if (!isLoaded) {
    return <PlaceholderBox className={className} message="Cargando mapa..." />;
  }

  return (
    <div
      className={`aspect-[16/9] w-full overflow-hidden rounded-xl sm:aspect-[2/1] ${className ?? ""}`}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat, lng }}
        zoom={15}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "cooperative",
        }}
      >
        <Marker position={{ lat, lng }} />
      </GoogleMap>
    </div>
  );
}
