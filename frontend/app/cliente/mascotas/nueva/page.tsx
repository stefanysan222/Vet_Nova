"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchPropietarioByUsuario } from "../../../../lib/api/propietarios";
import { createMascota } from "../../../../lib/api/mascotas";
import { useClienteProfile } from "../../ClienteProfileContext";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

type PropietarioActual = {
  nombreCompleto: string;
};

type FormularioMascota = {
  nombre: string;
  especie: "perro" | "gato" | "otro";
  especieOtra: string;
  raza: string;
  sexo: string;
  fechaNacimiento: string;
  peso: string;
  color: string;
  estado: "activo" | "tratamiento";
  observaciones: string;
};

const formularioInicial: FormularioMascota = {
  nombre: "",
  especie: "perro",
  especieOtra: "",
  raza: "",
  sexo: "",
  fechaNacimiento: "",
  peso: "",
  color: "",
  estado: "activo",
  observaciones: "",
};

const inputClassName =
  "mt-2 h-[48px] w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-[15px] text-[#10213A] outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/10 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:placeholder:text-[#64748B] dark:focus:border-[#2F6BFF]";

const labelClassName = "text-[14px] font-semibold text-[#10213A] dark:text-white";

export default function NuevaMascotaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { perfil: perfilCliente } = useClienteProfile();

  const propietario: PropietarioActual = {
    nombreCompleto:
      `${perfilCliente.nombre.trim() || "Cliente"} ${perfilCliente.apellido.trim()}`.trim(),
  };

  const [formulario, setFormulario] = useState<FormularioMascota>(formularioInicial);

  const [foto, setFoto] = useState<string | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [errorFoto, setErrorFoto] = useState("");
  const [errorFormulario, setErrorFormulario] = useState("");
  const [guardando, setGuardando] = useState(false);

  const actualizarCampo = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setFormulario(
      (actual) =>
        ({
          ...actual,
          [name]: value,
        }) as FormularioMascota,
    );

    setErrorFormulario("");
  };

  const uploadFotoCloudinary = async (archivo: File) => {
    setSubiendoFoto(true);
    setErrorFoto("");

    const formData = new FormData();
    formData.append("file", archivo);

    try {
      const respuesta = await fetch("/api/cloudinary/upload", {
        method: "POST",
        body: formData,
      });

      const json = await respuesta.json();

      if (!respuesta.ok || !json.url) {
        throw new Error(json.error || "Error subiendo la imagen.");
      }

      setFoto(json.url);
    } catch {
      setErrorFoto("No se pudo subir la imagen. Intenta de nuevo.");
    } finally {
      setSubiendoFoto(false);
    }
  };

  const seleccionarFoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0];

    setErrorFoto("");

    if (!archivo) {
      setFoto(null);
      return;
    }

    if (!["image/jpeg", "image/png"].includes(archivo.type)) {
      setErrorFoto("Solo puedes seleccionar imágenes JPG o PNG.");
      return;
    }

    if (archivo.size > MAX_IMAGE_SIZE) {
      setErrorFoto("La imagen debe pesar máximo 5 MB.");
      return;
    }

    await uploadFotoCloudinary(archivo);
    event.target.value = "";
  };

  const quitarFoto = () => {
    setFoto(null);
    setErrorFoto("");
  };

  const guardarMascota = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorFormulario("");

    if (!formulario.nombre.trim() || !formulario.raza.trim()) {
      setErrorFormulario("Completa el nombre y la raza de la mascota.");
      return;
    }

    if (formulario.especie === "otro" && !formulario.especieOtra.trim()) {
      setErrorFormulario("Completa la especie cuando seleccionas Otro.");
      return;
    }

    if (!user) {
      setErrorFormulario("No se encontró la sesión activa.");
      return;
    }

    setGuardando(true);

    try {
      const propietario = await fetchPropietarioByUsuario(user.id);
      if (!propietario) {
        setErrorFormulario("No se encontró el propietario asociado a tu cuenta.");
        return;
      }

      const sexoMapeado: "Macho" | "Hembra" | "No especificado" =
        formulario.sexo === "macho"
          ? "Macho"
          : formulario.sexo === "hembra"
            ? "Hembra"
            : "No especificado";

      const especieMapeada =
        formulario.especie === "perro"
          ? "Perro"
          : formulario.especie === "gato"
            ? "Gato"
            : formulario.especieOtra.trim();

      await createMascota({
        nombre: formulario.nombre.trim(),
        especie: especieMapeada,
        raza: formulario.raza.trim(),
        edad: calcularEdad(formulario.fechaNacimiento),
        peso: formulario.peso.trim(),
        sexo: sexoMapeado,
        fechaNacimiento: formulario.fechaNacimiento || undefined,
        foto: foto || undefined,
        propietarioId: propietario.id,
      });

      router.push("/cliente/mascotas");
    } catch (err) {
      setErrorFormulario(
        err instanceof Error ? err.message : "No se pudo guardar la mascota. Intenta de nuevo.",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F5F7FB] px-6 py-8 dark:bg-[#0F172A]">
      {/* Encabezado */}
      <div className="mb-8">
        <Link
          href="/cliente/mascotas"
          className="mb-5 inline-flex items-center gap-2 text-[14px] font-medium text-[#64748B] transition-colors hover:text-[#2F6BFF] dark:text-[#94A3B8] dark:hover:text-[#60A5FA]"
        >
          <ArrowLeftIcon />
          Volver a mascotas
        </Link>

        <h1 className="text-[24px] font-semibold leading-none text-[#10213A] dark:text-white">
          Nueva Mascota
        </h1>

        <p className="mt-4 text-[16px] text-[#64748B] dark:text-[#94A3B8]">
          Registra la información de tu mascota
        </p>
      </div>

      <form
        onSubmit={guardarMascota}
        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_360px]"
      >
        {/* Información de la mascota */}
        <section className="rounded-xl border border-[#CBD5E1] bg-white p-7 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]">
              <PetIcon />
            </div>

            <div>
              <h2 className="text-[20px] font-semibold text-[#10213A] dark:text-white">
                Información de la mascota
              </h2>

              <p className="mt-1 text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                Completa los datos básicos del registro
              </p>
            </div>
          </div>

          {/* Foto de la mascota */}
          <div className="mb-8 flex flex-col gap-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFD] p-5 dark:border-[#334155] dark:bg-[#0F172A] sm:flex-row sm:items-center">
            <div className="relative flex h-[104px] w-[104px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]">
              {foto ? (
                <Image
                  src={foto}
                  alt="Foto de la mascota"
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <PetIconLarge />
              )}
            </div>

            <div className="flex-1">
              <p className="text-[15px] font-semibold text-[#10213A] dark:text-white">
                Foto de la mascota
              </p>

              <p className="mt-2 text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                Selecciona una imagen JPG o PNG. Máximo 5 MB.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <label
                  htmlFor="fotoMascota"
                  className="inline-flex h-[42px] cursor-pointer items-center rounded-xl bg-[#2F6BFF] px-4 text-[14px] font-semibold text-white transition-all hover:bg-[#2457D6]"
                >
                  {subiendoFoto ? "Subiendo..." : "Seleccionar foto"}
                </label>

                {foto && (
                  <button
                    type="button"
                    onClick={quitarFoto}
                    className="inline-flex h-[42px] items-center rounded-xl border border-[#CBD5E1] bg-white px-4 text-[14px] font-semibold text-[#10213A] transition-all hover:border-[#EF4444] hover:text-[#EF4444] dark:border-[#334155] dark:bg-[#111827] dark:text-white"
                  >
                    Quitar foto
                  </button>
                )}
              </div>

              <input
                id="fotoMascota"
                type="file"
                accept="image/jpeg,image/png"
                onChange={seleccionarFoto}
                className="hidden"
              />

              {errorFoto && (
                <p className="mt-3 text-[13px] font-medium text-[#DC3545]">{errorFoto}</p>
              )}
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-2">
            <InputField
              label="Nombre"
              name="nombre"
              value={formulario.nombre}
              onChange={actualizarCampo}
              placeholder="Ej. Toby"
              required
            />

            <SelectField
              label="Especie"
              name="especie"
              value={formulario.especie}
              onChange={actualizarCampo}
              required
              options={[
                { value: "perro", label: "Perro" },
                { value: "gato", label: "Gato" },
                { value: "otro", label: "Otro" },
              ]}
            />

            {formulario.especie === "otro" && (
              <InputField
                label="Especie (otro)"
                name="especieOtra"
                value={formulario.especieOtra}
                onChange={actualizarCampo}
                placeholder="Ej. Ave, Reptil, Pequeño mamífero"
                required
              />
            )}

            <InputField
              label="Raza"
              name="raza"
              value={formulario.raza}
              onChange={actualizarCampo}
              placeholder="Ej. Golden Retriever"
              required
            />

            <SelectField
              label="Sexo"
              name="sexo"
              value={formulario.sexo}
              onChange={actualizarCampo}
              options={[
                { value: "", label: "Seleccionar sexo" },
                { value: "macho", label: "Macho" },
                { value: "hembra", label: "Hembra" },
              ]}
            />

            <InputField
              label="Fecha de nacimiento"
              name="fechaNacimiento"
              type="date"
              value={formulario.fechaNacimiento}
              onChange={actualizarCampo}
            />

            <InputField
              label="Peso aproximado (kg)"
              name="peso"
              type="number"
              value={formulario.peso}
              onChange={actualizarCampo}
              placeholder="Ej. 12.5"
            />

            <InputField
              label="Color"
              name="color"
              value={formulario.color}
              onChange={actualizarCampo}
              placeholder="Ej. Dorado"
            />

            <SelectField
              label="Estado"
              name="estado"
              value={formulario.estado}
              onChange={actualizarCampo}
              options={[
                { value: "activo", label: "Activo" },
                { value: "tratamiento", label: "En tratamiento" },
              ]}
            />
          </div>

          <div className="mt-6">
            <label htmlFor="observaciones" className={labelClassName}>
              Observaciones
            </label>

            <textarea
              id="observaciones"
              name="observaciones"
              value={formulario.observaciones}
              onChange={actualizarCampo}
              rows={4}
              placeholder="Alergias, cuidados especiales o información adicional..."
              className="mt-2 w-full resize-none rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-[15px] text-[#10213A] outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/10 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:placeholder:text-[#64748B] dark:focus:border-[#2F6BFF]"
            />
          </div>

          {errorFormulario && (
            <p className="mt-5 rounded-xl border border-[#F1CDD1] bg-[#FFF2F3] px-4 py-3 text-[14px] font-medium text-[#DC3545] dark:border-[#67333B] dark:bg-[#28171B]">
              {errorFormulario}
            </p>
          )}
        </section>

        {/* Panel lateral */}
        <aside className="space-y-5">
          <section className="rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
            <h2 className="text-[18px] font-semibold text-[#10213A] dark:text-white">
              Propietario asociado
            </h2>

            <div className="mt-5 flex items-center gap-4 rounded-xl bg-[#F5F7FB] p-4 dark:bg-[#0F172A]">
              <AvatarPropietario propietario={propietario} />

              <div>
                <p className="text-[15px] font-semibold text-[#10213A] dark:text-white">
                  {propietario.nombreCompleto}
                </p>

                <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">Cliente</p>
              </div>
            </div>

            <p className="mt-5 text-[14px] leading-6 text-[#64748B] dark:text-[#94A3B8]">
              Esta mascota quedará asociada automáticamente a tu cuenta.
            </p>
          </section>

          <section className="rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
            <button
              type="submit"
              disabled={guardando || subiendoFoto}
              className="inline-flex h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#2F6BFF] px-6 text-[15px] font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#2457D6] hover:shadow-[0_10px_20px_rgba(47,107,255,0.28)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {guardando ? "Guardando..." : "Guardar Mascota"}
            </button>

            <Link
              href="/cliente/mascotas"
              className="mt-3 inline-flex h-[48px] w-full items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-6 text-[15px] font-semibold text-[#10213A] transition-all hover:bg-[#F8FAFD] dark:border-[#334155] dark:bg-[#111827] dark:text-white dark:hover:bg-[#0F172A]"
            >
              Cancelar
            </Link>
          </section>
        </aside>
      </form>
    </div>
  );
}

function AvatarPropietario({ propietario }: { propietario: PropietarioActual }) {
  const iniciales = propietario.nombreCompleto
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="relative flex h-[48px] w-[48px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2F6BFF] text-[17px] font-semibold text-white">
      {iniciales || "C"}
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  type = "text",
  placeholder,
  required = false,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  type?: "text" | "date" | "number";
  placeholder?: string;
  required?: boolean;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClassName}>
        {label}
        {required && <span className="ml-1 text-[#2F6BFF]">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.1" : undefined}
        max={type === "date" ? obtenerFechaActual() : undefined}
        placeholder={placeholder}
        className={inputClassName}
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  options,
  required = false,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  required?: boolean;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClassName}>
        {label}
        {required && <span className="ml-1 text-[#2F6BFF]">*</span>}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={inputClassName}
      >
        {options.map((option) => (
          <option key={option.value || "empty"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function calcularEdad(fechaNacimiento: string) {
  if (!fechaNacimiento) {
    return "Edad no registrada";
  }

  const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
  const hoy = new Date();

  let años = hoy.getFullYear() - nacimiento.getFullYear();
  let meses = hoy.getMonth() - nacimiento.getMonth();

  if (hoy.getDate() < nacimiento.getDate()) {
    meses -= 1;
  }

  if (meses < 0) {
    años -= 1;
    meses += 12;
  }

  if (años > 0) {
    return años === 1 ? "1 año" : `${años} años`;
  }

  return meses === 1 ? "1 mes" : `${meses} meses`;
}

function obtenerFechaActual() {
  return new Date().toISOString().split("T")[0];
}

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PetIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 12.5c-2 0-3.5 1.5-3.5 3.4 0 2.2 1.8 3.6 4 3.6h7c2.2 0 4-1.4 4-3.6 0-1.9-1.5-3.4-3.5-3.4"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9 8.5C9 10.4 8 12 6.7 12S4.5 10.4 4.5 8.5 5.5 5 6.7 5 9 6.6 9 8.5Zm10.5 0c0 1.9-1 3.5-2.2 3.5S15 10.4 15 8.5 16 5 17.3 5s2.2 1.6 2.2 3.5ZM14.5 8c0 2-1.1 3.6-2.5 3.6S9.5 10 9.5 8 10.6 4.4 12 4.4 14.5 6 14.5 8Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}
function PetIconLarge() {
  return (
    <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 12.5c-2 0-3.5 1.5-3.5 3.4 0 2.2 1.8 3.6 4 3.6h7c2.2 0 4-1.4 4-3.6 0-1.9-1.5-3.4-3.5-3.4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9 8.5C9 10.4 8 12 6.7 12S4.5 10.4 4.5 8.5 5.5 5 6.7 5 9 6.6 9 8.5Zm10.5 0c0 1.9-1 3.5-2.2 3.5S15 10.4 15 8.5 16 5 17.3 5s2.2 1.6 2.2 3.5ZM14.5 8c0 2-1.1 3.6-2.5 3.6S9.5 10 9.5 8 10.6 4.4 12 4.4 14.5 6 14.5 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
