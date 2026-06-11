"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { Search, X, PawPrint, CalendarDays, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { fetchCitas } from "../../lib/api/citas";
import { fetchMascotas } from "../../lib/api/mascotas";
import { fetchPropietarioByUsuario } from "../../lib/api/propietarios";

type Mascota = {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  dueño?: string;
};

type Cita = {
  id: string;
  mascota: string;
  servicio: string;
  fecha?: string;
  hora?: string;
  veterinario?: string;
  estado?: string;
};

type ResultadoBusqueda = {
  id: string;
  tipo: "Mascota" | "Cita";
  titulo: string;
  detalle: string;
  href: string;
};

export default function BuscadorCliente() {
  const router = useRouter();
  const pathname = usePathname();
  const contenedorRef = useRef<HTMLDivElement>(null);

  const [termino, setTermino] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const uid = Number(user.id);

    fetchPropietarioByUsuario(uid)
      .then((prop) => {
        if (!prop) return;
        return fetchMascotas(parseInt(prop.id, 10));
      })
      .then((pets) => {
        if (!pets) return;
        setMascotas(
          pets.map((p) => ({
            id: p.id,
            nombre: p.nombre,
            especie: p.especie,
            raza: p.raza,
            dueño: p.propietarioNombre,
          })),
        );
      })
      .catch(() => {});

    fetchCitas(uid)
      .then((appts) => {
        setCitas(
          appts.map((a) => ({
            id: a.id,
            mascota: a.petName,
            servicio: a.service,
            fecha: a.date,
            hora: a.time,
            veterinario: a.veterinarian,
            estado: a.status,
          })),
        );
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    // Limpiar el buscador al cambiar de ruta — flips de booleano/string sin riesgo de cascada
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTermino("");
    setAbierto(false);
  }, [pathname]);

  useEffect(() => {
    const cerrarAlHacerClickFuera = (event: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    };

    document.addEventListener("mousedown", cerrarAlHacerClickFuera);

    return () => {
      document.removeEventListener("mousedown", cerrarAlHacerClickFuera);
    };
  }, []);

  const resultados = useMemo(() => {
    const textoBuscado = normalizarTexto(termino.trim());

    if (!textoBuscado) return [];

    const resultadosMascotas: ResultadoBusqueda[] = mascotas
      .filter((mascota) => {
        const contenido = normalizarTexto(
          `${mascota.nombre} ${mascota.especie} ${mascota.raza} ${mascota.dueño ?? ""}`,
        );

        return contenido.includes(textoBuscado);
      })
      .map((mascota) => ({
        id: `mascota-${mascota.id}`,
        tipo: "Mascota",
        titulo: mascota.nombre,
        detalle: `${mascota.especie} · ${mascota.raza}`,
        href: "/cliente/mascotas",
      }));

    const resultadosCitas: ResultadoBusqueda[] = citas
      .filter((cita) => {
        const contenido = normalizarTexto(
          `${cita.mascota} ${cita.servicio} ${cita.fecha ?? ""} ${
            cita.hora ?? ""
          } ${cita.veterinario ?? ""} ${cita.estado ?? ""}`,
        );

        return contenido.includes(textoBuscado);
      })
      .map((cita) => ({
        id: `cita-${cita.id}`,
        tipo: "Cita",
        titulo: cita.mascota,
        detalle: `${cita.servicio}${cita.fecha ? ` · ${cita.fecha}` : ""}${
          cita.hora ? ` · ${cita.hora}` : ""
        }`,
        href: "/cliente/agendar",
      }));

    return [...resultadosMascotas, ...resultadosCitas].slice(0, 8);
  }, [termino, mascotas, citas]);

  const handleInputChange = (value: string) => {
    setTermino(value);
    setAbierto(value.trim().length > 0);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setAbierto(false);
      return;
    }

    if (event.key === "Enter" && resultados.length > 0) {
      event.preventDefault();
      router.push(resultados[0].href);
      setTermino("");
      setAbierto(false);
    }
  };

  const limpiarBusqueda = () => {
    setTermino("");
    setAbierto(false);
  };

  return (
    <div ref={contenedorRef} className="relative w-full max-w-[505px]">
      <div className="flex h-[42px] items-center gap-3 rounded-lg border border-surface-300 bg-white px-4 transition-all focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 dark:border-surface-700 dark:bg-surface-900 dark:focus-within:border-brand-500">
        <Search className="h-[18px] w-[18px] shrink-0 text-surface-500 dark:text-surface-400" />

        <input
          type="text"
          value={termino}
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={() => {
            if (termino.trim()) {
              setAbierto(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Buscar mascotas, citas..."
          className="w-full bg-transparent text-sm text-surface-900 outline-none placeholder:text-surface-400 dark:text-white"
        />

        {termino && (
          <button
            type="button"
            onClick={limpiarBusqueda}
            aria-label="Limpiar búsqueda"
            className="text-surface-400 transition-colors hover:text-brand-600 dark:hover:text-brand-300"
          >
            <X className="h-[17px] w-[17px]" />
          </button>
        )}
      </div>

      {abierto && (
        <div className="absolute left-0 top-[50px] z-[80] w-full overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-modal dark:border-surface-700 dark:bg-surface-900">
          <div className="border-b border-surface-200 px-4 py-3 dark:border-surface-700">
            <p className="text-xs font-medium text-surface-500 dark:text-surface-400">
              {resultados.length > 0
                ? `${resultados.length} ${
                    resultados.length === 1 ? "resultado encontrado" : "resultados encontrados"
                  }`
                : "Resultados de búsqueda"}
            </p>
          </div>

          {resultados.length > 0 ? (
            <div className="max-h-[330px] overflow-y-auto py-2">
              {resultados.map((resultado) => (
                <Link
                  key={resultado.id}
                  href={resultado.href}
                  onClick={limpiarBusqueda}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800"
                >
                  <div
                    className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl ${
                      resultado.tipo === "Mascota"
                        ? "bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300"
                        : "bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300"
                    }`}
                  >
                    {resultado.tipo === "Mascota" ? (
                      <PawPrint className="h-[21px] w-[21px]" />
                    ) : (
                      <CalendarDays className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-surface-900 dark:text-white">
                        {resultado.titulo}
                      </p>

                      <span className="rounded-lg bg-surface-100 px-2 py-0.5 text-[11px] font-semibold text-surface-600 dark:bg-surface-800 dark:text-surface-300">
                        {resultado.tipo}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-xs text-surface-500 dark:text-surface-400">
                      {resultado.detalle}
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-surface-400" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 py-8 text-center">
              <div className="mb-3 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                <Search className="h-[25px] w-[25px]" />
              </div>

              <p className="text-sm font-semibold text-surface-900 dark:text-white">
                No se encontraron resultados
              </p>

              <p className="mt-2 text-xs text-surface-500 dark:text-surface-400">
                Busca por nombre de mascota, raza o información de una cita.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function normalizarTexto(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
