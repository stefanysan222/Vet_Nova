"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="dark:bg-danger-950/10 flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-danger-100 bg-danger-50/40 px-6 text-center dark:border-danger-900/30">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-100 text-danger-500 dark:bg-danger-900/40 dark:text-danger-400">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="text-section-title">No se pudo cargar esta sección</h2>
      <p className="text-subtitle mt-2">
        Ocurrió un error inesperado. Puedes intentar de nuevo o recargar la página.
      </p>
      <button
        onClick={reset}
        className="mt-6 inline-flex h-10 items-center rounded-xl bg-danger-500 px-5 text-xs font-semibold text-white transition hover:bg-danger-600 active:scale-[0.98]"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
