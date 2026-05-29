"use client";

import { useRef, useState } from "react";

type AntecedentesClinicosUploadProps = {
  onFilesChange?: (files: File[]) => void;
};

type ArchivoAdjunto = {
  id: string;
  file: File;
};

const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024;

const TIPOS_PERMITIDOS = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

export function AntecedentesClinicosUpload({
  onFilesChange,
}: AntecedentesClinicosUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [archivos, setArchivos] = useState<ArchivoAdjunto[]>([]);
  const [arrastrando, setArrastrando] = useState(false);
  const [error, setError] = useState("");

  const procesarArchivos = (nuevosArchivos: File[]) => {
    setError("");

    const archivosValidos = nuevosArchivos.filter((archivo) => {
      if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
        setError("Solo se permiten archivos PDF, JPG o PNG.");
        return false;
      }

      if (archivo.size > MAX_SIZE) {
        setError("Cada archivo debe pesar máximo 10 MB.");
        return false;
      }

      return true;
    });

    const nuevos: ArchivoAdjunto[] = archivosValidos.map((archivo) => ({
      id: `${archivo.name}-${archivo.lastModified}-${archivo.size}`,
      file: archivo,
    }));

    setArchivos((actuales) => {
      const combinados = [...actuales, ...nuevos].filter(
        (archivo, indice, arreglo) =>
          indice ===
          arreglo.findIndex(
            (item) =>
              item.file.name === archivo.file.name &&
              item.file.size === archivo.file.size
          )
      );

      if (combinados.length > MAX_FILES) {
        setError("Puedes adjuntar máximo 5 documentos.");
        const limitados = combinados.slice(0, MAX_FILES);
        onFilesChange?.(limitados.map((archivo) => archivo.file));
        return limitados;
      }

      onFilesChange?.(combinados.map((archivo) => archivo.file));
      return combinados;
    });
  };

  const seleccionarArchivos = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);
    procesarArchivos(files);
    event.target.value = "";
  };

  const eliminarArchivo = (id: string) => {
    setArchivos((actuales) => {
      const actualizados = actuales.filter((archivo) => archivo.id !== id);
      onFilesChange?.(actualizados.map((archivo) => archivo.file));
      return actualizados;
    });

    setError("");
  };

  const manejarDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setArrastrando(false);

    const files = Array.from(event.dataTransfer.files);
    procesarArchivos(files);
  };

  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-[18px] font-semibold text-[#10213A] dark:text-white">
            Antecedentes clínicos
          </h2>

          <span className="rounded-full bg-[#EEF4FF] px-3 py-1 text-[12px] font-medium text-[#2F6BFF] dark:bg-[#1E3A8A]/30">
            Opcional
          </span>
        </div>

        <p className="mt-2 text-[14px] leading-6 text-[#64748B] dark:text-[#94A3B8]">
          Adjunta documentos anteriores de tu mascota para que el veterinario
          pueda consultar información relevante antes de la atención.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        multiple
        onChange={seleccionarArchivos}
        className="hidden"
      />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={manejarDrop}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-all ${
          arrastrando
            ? "border-[#2F6BFF] bg-[#EEF4FF] dark:bg-[#172554]"
            : "border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#2F6BFF] hover:bg-[#F4F7FF] dark:border-[#334155] dark:bg-[#0F172A]"
        }`}
      >
        <div className="mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#EEF4FF] text-[#2F6BFF] dark:bg-[#1E3A8A]/30">
          <UploadIcon />
        </div>

        <p className="text-[15px] font-medium text-[#10213A] dark:text-white">
          Arrastra tus documentos aquí
        </p>

        <p className="mt-1 text-[14px] text-[#64748B] dark:text-[#94A3B8]">
          o selecciona archivos desde tu dispositivo
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-5 inline-flex h-[44px] items-center justify-center rounded-xl border border-[#2F6BFF] bg-white px-5 text-[14px] font-semibold text-[#2F6BFF] transition-all hover:bg-[#EEF4FF] dark:bg-transparent"
        >
          Seleccionar archivos
        </button>

        <p className="mt-4 text-[12px] text-[#94A3B8]">
          PDF, JPG o PNG · Máximo 10 MB por archivo · Hasta 5 documentos
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#DC2626]">
          {error}
        </div>
      )}

      {archivos.length > 0 && (
        <div className="mt-5 space-y-3">
          <p className="text-[14px] font-medium text-[#10213A] dark:text-white">
            Documentos adjuntos
          </p>

          {archivos.map((archivo) => (
            <div
              key={archivo.id}
              className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 dark:border-[#334155] dark:bg-[#0F172A]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-[#EEF4FF] text-[#2F6BFF] dark:bg-[#1E3A8A]/30">
                  <DocumentIcon />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-[#10213A] dark:text-white">
                    {archivo.file.name}
                  </p>

                  <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                    {formatearTamano(archivo.file.size)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => eliminarArchivo(archivo.id)}
                aria-label={`Eliminar ${archivo.file.name}`}
                className="ml-4 flex h-[36px] w-[36px] items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#FEE2E2] hover:text-[#DC2626]"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#F8FAFC] px-4 py-3 dark:bg-[#0F172A]">
        <InfoIcon />

        <p className="text-[12px] leading-5 text-[#64748B] dark:text-[#94A3B8]">
          Puedes adjuntar historias clínicas anteriores, resultados de
          exámenes, fórmulas médicas o carné de vacunación. Estos documentos
          serán consultados únicamente por el personal autorizado de la clínica.
        </p>
      </div>
    </section>
  );
}

function formatearTamano(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 16V4M12 4 7.5 8.5M12 4l4.5 4.5M5 16.5v2A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3.5h7l4 4v13H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14 3.5v5h4M9 13h6M9 16.5h4"
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
      className="mt-0.5 shrink-0 text-[#2F6BFF]"
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