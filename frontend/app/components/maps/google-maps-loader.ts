// Configuración compartida para useJsApiLoader: el mismo `id` y el mismo
// arreglo de `libraries` deben usarse en todos los componentes de mapa,
// para que @react-google-maps/api reutilice una sola carga del script de
// Google Maps en vez de intentar inyectarlo más de una vez.
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
export const GOOGLE_MAPS_SCRIPT_ID = "vetnova-google-maps-script";
export const GOOGLE_MAPS_LIBRARIES: "places"[] = ["places"];
