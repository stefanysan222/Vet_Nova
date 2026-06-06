"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { getCurrentUser } from "../../../../lib/auth";
import { fetchPropietarioByUsuario } from "../../../../lib/api/propietarios";
import { createMascota } from "../../../../lib/api/mascotas";

const PROFILE_STORAGE_KEY = "vetnova_cliente_perfil";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_DOCUMENTS = 5;
const DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];

type PerfilCliente = {
  nombre?: string;
  apellido?: string;
  foto?: string | null;
};

type DocumentoClinicoAdjunto = {
  id: string;
  nombre: string;
  tipo: string;
  tamano: number;
  fechaCarga: string;
  dataUrl?: string;
};

type PropietarioActual = {
  nombreCompleto: string;
  foto: string | null;
};

const propietarioInicial: PropietarioActual = {
  nombreCompleto: "Cliente",
  foto: null,
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

const labelClassName =
  "text-[14px] font-semibold text-[#10213A] dark:text-white";

export default function NuevaMascotaPage() {
  const router = useRouter();

  const [propietario, setPropietario] =
    useState<PropietarioActual>(propietarioInicial);

  const [formulario, setFormulario] =
    useState<FormularioMascota>(formularioInicial);

  const [foto, setFoto] = useState<string | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [errorFoto, setErrorFoto] = useState("");
  const [errorFormulario, setErrorFormulario] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [documentosClinicos, setDocumentosClinicos] = useState<DocumentoClinicoAdjunto[]>([]);
  const [errorDocumentos, setErrorDocumentos] = useState("");

  useEffect(() => {
    const cargarPropietario = () => {
      setPropietario(leerPropietarioActual());
    };

    cargarPropietario();

    window.addEventListener("vetnova-profile-updated", cargarPropietario);
    window.addEventListener("storage", cargarPropietario);

    return () => {
      window.removeEventListener(
        "vetnova-profile-updated",
        cargarPropietario
      );
      window.removeEventListener("storage", cargarPropietario);
    };
  }, []);

  const actualizarCampo = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setFormulario(
      (actual) =>
        ({
          ...actual,
          [name]: value,
        }) as FormularioMascota
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
    } catch (error) {
      setErrorFoto("No se pudo subir la imagen. Intenta de nuevo.");
      console.error(error);
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

  const seleccionarDocumentosClinicos = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const archivosSeleccionados = Array.from(event.target.files ?? []);

    setErrorDocumentos("");
    event.target.value = "";

    if (archivosSeleccionados.length === 0) {
      return;
    }

    const archivoNoPermitido = archivosSeleccionados.find(
      (archivo) => !DOCUMENT_TYPES.includes(archivo.type)
    );

    if (archivoNoPermitido) {
      setErrorDocumentos("Solo puedes adjuntar archivos PDF, JPG o PNG.");
      return;
    }

    const archivoMuyGrande = archivosSeleccionados.find(
      (archivo) => archivo.size > MAX_DOCUMENT_SIZE
    );

    if (archivoMuyGrande) {
      setErrorDocumentos("Cada documento debe pesar máximo 5 MB.");
      return;
    }

    const nuevosDocumentos: DocumentoClinicoAdjunto[] = [];

    const archivosParaLeer = archivosSeleccionados.filter((archivo) => {
      const estaRepetido =
        documentosClinicos.some(
          (documento) =>
            documento.nombre === archivo.name &&
            documento.tamano === archivo.size
        ) ||
        nuevosDocumentos.some(
          (documento) =>
            documento.nombre === archivo.name &&
            documento.tamano === archivo.size
        );

      return !estaRepetido;
    });

    if (archivosParaLeer.length === 0) {
      setErrorDocumentos("Los documentos seleccionados ya fueron adjuntados.");
      return;
    }

    if (documentosClinicos.length + archivosParaLeer.length > MAX_DOCUMENTS) {
      setErrorDocumentos(`Puedes adjuntar máximo ${MAX_DOCUMENTS} documentos.`);
      return;
    }

    const readFileAsDataUrl = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Error leyendo archivo"));
        reader.readAsDataURL(file);
      });

    Promise.all(
      archivosParaLeer.map(async (archivo) => {
        const dataUrl = await readFileAsDataUrl(archivo);

        return {
          id: crypto.randomUUID(),
          nombre: archivo.name,
          tipo: obtenerTipoDocumento(archivo.type),
          tamano: archivo.size,
          fechaCarga: new Date().toISOString(),
          dataUrl,
        } as DocumentoClinicoAdjunto;
      })
    )
      .then((leidos) => {
        setDocumentosClinicos((actuales) => [...actuales, ...leidos]);
      })
      .catch(() => {
        setErrorDocumentos("Hubo un error al procesar los archivos.");
      });
  };

  const quitarDocumentoClinico = (id: string) => {
    setDocumentosClinicos((actuales) =>
      actuales.filter((documento) => documento.id !== id)
    );
    setErrorDocumentos("");
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

    const user = getCurrentUser();
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
        err instanceof Error ? err.message : "No se pudo guardar la mascota. Intenta de nuevo."
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
          <div className="mb-8 flex flex-col gap-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFD] p-5 sm:flex-row sm:items-center dark:border-[#334155] dark:bg-[#0F172A]">
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
                <p className="mt-3 text-[13px] font-medium text-[#DC3545]">
                  {errorFoto}
                </p>
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

          <div className="mt-7">
            <AntecedentesClinicosCard
              documentos={documentosClinicos}
              error={errorDocumentos}
              onSeleccionar={seleccionarDocumentosClinicos}
              onEliminar={quitarDocumentoClinico}
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

                <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                  Cliente
                </p>
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
              className="inline-flex h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#2F6BFF] px-6 text-[15px] font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#2457D6] hover:shadow-[0_10px_20px_rgba(47,107,255,0.28)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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

function leerPropietarioActual(): PropietarioActual {
  if (typeof window === "undefined") {
    return propietarioInicial;
  }

  try {
    const perfilGuardado = localStorage.getItem(PROFILE_STORAGE_KEY);

    if (!perfilGuardado) {
      return propietarioInicial;
    }

    const perfil = JSON.parse(perfilGuardado) as PerfilCliente;

    const nombreCompleto = `${perfil.nombre?.trim() || "Cliente"} ${
      perfil.apellido?.trim() || ""
    }`.trim();

    return {
      nombreCompleto,
      foto: perfil.foto || null,
    };
  } catch {
    return propietarioInicial;
  }
}

function AvatarPropietario({
  propietario,
}: {
  propietario: PropietarioActual;
}) {
  const iniciales = propietario.nombreCompleto
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="relative flex h-[48px] w-[48px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2F6BFF] text-[17px] font-semibold text-white">
      {propietario.foto ? (
        <Image
          src={propietario.foto}
          alt={`Foto de ${propietario.nombreCompleto}`}
          fill
          unoptimized
          className="object-cover"
        />
      ) : (
        iniciales || "C"
      )}
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
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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
function AntecedentesClinicosCard({
  documentos,
  error,
  onSeleccionar,
  onEliminar,
}: {
  documentos: DocumentoClinicoAdjunto[];
  error: string;
  onSeleccionar: (event: ChangeEvent<HTMLInputElement>) => void;
  onEliminar: (id: string) => void;
}) {
  return (
    <section className="rounded-xl border border-[#D6E1F0] bg-[#F8FAFD] p-5 dark:border-[#334155] dark:bg-[#0F172A]">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-[17px] font-semibold text-[#10213A] dark:text-white">
          Antecedentes clínicos
        </h3>

        <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-[12px] font-semibold text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]">
          Opcional
        </span>
      </div>

      <p className="mt-2 text-[14px] leading-6 text-[#64748B] dark:text-[#94A3B8]">
        Adjunta historias clínicas anteriores, carné de vacunación o resultados de exámenes para que el veterinario conozca sus antecedentes.
      </p>

      <label
        htmlFor="documentosClinicos"
        className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#CBD5E1] bg-white px-5 py-7 text-center transition-all hover:border-[#2F6BFF] hover:bg-[#F5F8FF] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#60A5FA]"
      >
        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-xl bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]">
          <UploadDocumentIcon />
        </div>

        <p className="mt-3 text-[14px] font-semibold text-[#10213A] dark:text-white">
          Seleccionar documentos
        </p>

        <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
          PDF, JPG o PNG · Máximo 5 MB · Hasta 5 archivos
        </p>
      </label>

      <input
        id="documentosClinicos"
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        multiple
        onChange={onSeleccionar}
        className="hidden"
      />

      {error && (
        <p className="mt-4 rounded-xl border border-[#F1CDD1] bg-[#FFF2F3] px-4 py-3 text-[13px] font-medium text-[#DC3545] dark:border-[#67333B] dark:bg-[#28171B]">
          {error}
        </p>
      )}

      {documentos.length > 0 && (
        <div className="mt-5 space-y-3">
          <p className="text-[13px] font-semibold text-[#10213A] dark:text-white">
            Documentos seleccionados
          </p>

          {documentos.map((documento) => (
            <div
              key={documento.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 dark:border-[#334155] dark:bg-[#111827]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]">
                  <FileIcon />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-[#10213A] dark:text-white">
                    {documento.nombre}
                  </p>

                  <p className="mt-0.5 text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                    {documento.tipo} · {formatearTamano(documento.tamano)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEliminar(documento.id)}
                  aria-label={`Eliminar ${documento.nombre}`}
                  className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#FFF2F3] hover:text-[#DC3545] dark:text-[#94A3B8]"
                >
                  <TrashIcon />
                </button>

                {documento.dataUrl && (
                  <>
                    <button
                      type="button"
                      onClick={() => window.open(documento.dataUrl, "_blank")}
                      className="inline-flex h-[36px] items-center justify-center rounded-lg border border-[#E6EEF8] bg-white px-3 text-[13px] text-[#10213A] transition-colors hover:bg-[#F5F8FF] dark:border-transparent"
                    >
                      Ver
                    </button>

                    <a
                      href={documento.dataUrl}
                      download={documento.nombre}
                      className="inline-flex h-[36px] items-center justify-center rounded-lg border border-[#E6EEF8] bg-white px-3 text-[13px] text-[#10213A] transition-colors hover:bg-[#F5F8FF] dark:border-transparent"
                    >
                      Descargar
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-start gap-3 rounded-xl bg-white px-4 py-3 dark:bg-[#111827]">
        <InfoIcon />

        <p className="text-[12px] leading-5 text-[#64748B] dark:text-[#94A3B8]">
          Los documentos serán visibles únicamente para el propietario y el personal veterinario autorizado.
        </p>
      </div>
    </section>
  );
}

function obtenerTipoDocumento(tipo: string) {
  if (tipo === "application/pdf") {
    return "PDF";
  }

  if (tipo === "image/png") {
    return "PNG";
  }

  return "JPG";
}

function formatearTamano(tamano: number) {
  if (tamano < 1024 * 1024) {
    return `${(tamano / 1024).toFixed(1)} KB`;
  }

  return `${(tamano / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3.5h7l4 4V20H7a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14 3.5v5h4M9 13h6M9 16.5h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 7h14M10 11v6M14 11v6M9 7V4.5h6V7M7 7l1 13h8l1-13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      className="mt-0.5 shrink-0 text-[#2563EB]"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 10.5v6M12 7.5h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UploadDocumentIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15.5V4M12 4 7.5 8.5M12 4l4.5 4.5M5 17v1.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
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