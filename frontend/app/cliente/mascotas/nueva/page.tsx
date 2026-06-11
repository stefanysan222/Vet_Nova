"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { ArrowLeft } from "lucide-react";
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

const inputClassName = "form-input mt-2";

const labelClassName = "form-label";

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
    <div className="h-full overflow-y-auto bg-surface-50 px-6 py-8 dark:bg-surface-950">
      {/* Encabezado */}
      <div className="mb-8">
        <Link
          href="/cliente/mascotas"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-surface-500 transition-colors hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
          Volver a mascotas
        </Link>

        <h1 className="text-page-title">Nueva Mascota</h1>

        <p className="text-subtitle mt-2">Registra la información de tu mascota</p>
      </div>

      <form
        onSubmit={guardarMascota}
        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_360px]"
      >
        {/* Información de la mascota */}
        <section className="rounded-xl border border-surface-200 bg-white p-7 shadow-sm dark:border-surface-700 dark:bg-surface-900">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
              <PetIcon />
            </div>

            <div>
              <h2 className="text-section-title">Información de la mascota</h2>

              <p className="text-subtitle mt-1">Completa los datos básicos del registro</p>
            </div>
          </div>

          {/* Foto de la mascota */}
          <div className="mb-8 flex flex-col gap-5 rounded-xl border border-surface-200 bg-surface-50 p-5 dark:border-surface-700 dark:bg-surface-950 sm:flex-row sm:items-center">
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
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
              <p className="text-sm font-semibold text-surface-900 dark:text-white">
                Foto de la mascota
              </p>

              <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
                Selecciona una imagen JPG o PNG. Máximo 5 MB.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <label
                  htmlFor="fotoMascota"
                  className="inline-flex h-10 cursor-pointer items-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-all hover:bg-brand-700"
                >
                  {subiendoFoto ? "Subiendo..." : "Seleccionar foto"}
                </label>

                {foto && (
                  <button
                    type="button"
                    onClick={quitarFoto}
                    className="inline-flex h-10 items-center rounded-xl border border-surface-200 bg-white px-4 text-sm font-semibold text-surface-900 transition-all hover:border-danger-400 hover:text-danger-600 dark:border-surface-700 dark:bg-surface-900 dark:text-white"
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

              {errorFoto && <p className="mt-3 text-xs font-medium text-danger-600">{errorFoto}</p>}
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
              className="form-input mt-2 resize-none"
            />
          </div>

          {errorFormulario && (
            <p className="dark:bg-danger-950/30 mt-5 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-600 dark:border-danger-800 dark:text-danger-400">
              {errorFormulario}
            </p>
          )}
        </section>

        {/* Panel lateral */}
        <aside className="space-y-5">
          <section className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm dark:border-surface-700 dark:bg-surface-900">
            <h2 className="text-section-title">Propietario asociado</h2>

            <div className="mt-5 flex items-center gap-4 rounded-xl bg-surface-50 p-4 dark:bg-surface-950">
              <AvatarPropietario propietario={propietario} />

              <div>
                <p className="text-sm font-semibold text-surface-900 dark:text-white">
                  {propietario.nombreCompleto}
                </p>

                <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">Cliente</p>
              </div>
            </div>

            <p className="text-body mt-5">
              Esta mascota quedará asociada automáticamente a tu cuenta.
            </p>
          </section>

          <section className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm dark:border-surface-700 dark:bg-surface-900">
            <button
              type="submit"
              disabled={guardando || subiendoFoto}
              className="btn-primary w-full"
            >
              {guardando ? "Guardando..." : "Guardar Mascota"}
            </button>

            <Link href="/cliente/mascotas" className="btn-secondary mt-3 w-full">
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
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-600 text-base font-semibold text-white">
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
        {required && <span className="ml-1 text-brand-600">*</span>}
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
        {required && <span className="ml-1 text-brand-600">*</span>}
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
