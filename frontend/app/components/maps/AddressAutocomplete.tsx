"use client";

import { useCallback, useRef, useState } from "react";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { MapPin } from "lucide-react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const LIBRARIES: "places"[] = ["places"];

export interface AddressAutocompleteSelection {
  direccion: string;
  latitud: number;
  longitud: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (selection: AddressAutocompleteSelection) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  className,
  id,
  name,
}: AddressAutocompleteProps) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [loadError, setLoadError] = useState(false);

  const { isLoaded, loadError: jsApiLoadError } = useJsApiLoader({
    id: "vetnova-google-maps-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  const handleLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  }, []);

  const handlePlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place || !place.geometry || !place.geometry.location) return;
    const direccion = place.formatted_address || place.name || "";
    const latitud = place.geometry.location.lat();
    const longitud = place.geometry.location.lng();
    onChange(direccion);
    onSelect({ direccion, latitud, longitud });
  }, [onChange, onSelect]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="space-y-1.5">
        <input
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={className}
        />
        <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para habilitar el autocompletado de direcciones.
        </p>
      </div>
    );
  }

  if (jsApiLoadError || loadError) {
    return (
      <div className="space-y-1.5">
        <input
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={className}
        />
        <p className="flex items-center gap-1.5 text-xs text-danger-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          No se pudo cargar Google Maps. Verifica la API key configurada.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <input
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        disabled
      />
    );
  }

  return (
    <Autocomplete
      onLoad={handleLoad}
      onPlaceChanged={handlePlaceChanged}
      onUnmount={() => setLoadError(false)}
    >
      <input
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
    </Autocomplete>
  );
}
