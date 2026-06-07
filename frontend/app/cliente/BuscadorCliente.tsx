"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
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
      <div className="flex h-[42px] items-center gap-3 rounded-lg border border-[#CBD5E1] bg-white px-4 transition-all focus-within:border-[#2F6BFF] focus-within:ring-2 focus-within:ring-[#2F6BFF]/10 dark:border-[#334155] dark:bg-[#0F172A] dark:focus-within:border-[#2F6BFF]">
        <SearchIcon />

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
          className="w-full bg-transparent text-[14px] text-[#10213A] outline-none placeholder:text-[#94A3B8] dark:text-white"
        />

        {termino && (
          <button
            type="button"
            onClick={limpiarBusqueda}
            aria-label="Limpiar búsqueda"
            className="text-[#94A3B8] transition-colors hover:text-[#2F6BFF] dark:hover:text-[#60A5FA]"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {abierto && (
        <div className="absolute left-0 top-[50px] z-[80] w-full overflow-hidden rounded-xl border border-[#CBD5E1] bg-white shadow-[0_14px_32px_rgba(15,23,42,0.16)] dark:border-[#334155] dark:bg-[#111827]">
          <div className="border-b border-[#E2E8F0] px-4 py-3 dark:border-[#334155]">
            <p className="text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8]">
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
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#F5F7FB] dark:hover:bg-[#1E293B]"
                >
                  <div
                    className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl ${
                      resultado.tipo === "Mascota"
                        ? "bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]"
                        : "bg-[#E8F7EE] text-[#16A34A] dark:bg-[#123B22] dark:text-[#86EFAC]"
                    }`}
                  >
                    {resultado.tipo === "Mascota" ? <PetIcon /> : <CalendarIcon />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[14px] font-semibold text-[#10213A] dark:text-white">
                        {resultado.titulo}
                      </p>

                      <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-semibold text-[#52698A] dark:bg-[#1E293B] dark:text-[#CBD5E1]">
                        {resultado.tipo}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                      {resultado.detalle}
                    </p>
                  </div>

                  <ArrowIcon />
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 py-8 text-center">
              <div className="mb-3 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]">
                <SearchLargeIcon />
              </div>

              <p className="text-[14px] font-semibold text-[#10213A] dark:text-white">
                No se encontraron resultados
              </p>

              <p className="mt-2 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
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

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 text-[#64748B] dark:text-[#94A3B8]"
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchLargeIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PetIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 12.5c-2 0-3.5 1.5-3.5 3.4 0 2.2 1.8 3.6 4 3.6h7c2.2 0 4-1.4 4-3.6 0-1.9-1.5-3.4-3.5-3.4"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M9 8.5C9 10.4 8 12 6.7 12S4.5 10.4 4.5 8.5 5.5 5 6.7 5 9 6.6 9 8.5Zm10.5 0c0 1.9-1 3.5-2.2 3.5S15 10.4 15 8.5 16 5 17.3 5s2.2 1.6 2.2 3.5ZM14.5 8c0 2-1.1 3.6-2.5 3.6S9.5 10 9.5 8 10.6 4.4 12 4.4 14.5 6 14.5 8Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3v4M17 3v4M4.5 9.5h15M6.5 5h11a2 2 0 0 1 2 2v11.5a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#94A3B8]">
      <path
        d="m9 18 6-6-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
