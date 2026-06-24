"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Genera la lista de "páginas" a renderizar, intercalando el marcador
 * "ellipsis" cuando hay huecos. Patrón típico: 1 ... 4 5 [6] 7 8 ... 20
 */
function buildPageList(page: number, totalPages: number): (number | "ellipsis")[] {
  const siblingCount = 1;
  const totalVisible = siblingCount * 2 + 5; // primero, último, actual, 2 hermanos, 2 ellipsis

  if (totalPages <= totalVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, totalPages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  const pages: (number | "ellipsis")[] = [1];

  if (showLeftEllipsis) {
    pages.push("ellipsis");
  } else {
    for (let p = 2; p < leftSibling; p++) pages.push(p);
  }

  for (let p = leftSibling; p <= rightSibling; p++) {
    if (p !== 1 && p !== totalPages) pages.push(p);
  }

  if (showRightEllipsis) {
    pages.push("ellipsis");
  } else {
    for (let p = rightSibling + 1; p < totalPages; p++) pages.push(p);
  }

  pages.push(totalPages);

  return pages;
}

/**
 * Paginación genérica reutilizable con números de página y elipsis.
 * Úsala en cualquier listado/tabla que reciba `page`, `totalPages` desde
 * el backend (patrón page/limit/total ya usado por varios endpoints).
 */
export default function Pagination({
  page,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);

  return (
    <nav className={`flex items-center justify-center gap-1 ${className}`} aria-label="Paginación">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="btn-secondary px-2.5 py-1.5 text-xs disabled:opacity-40"
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, idx) =>
          p === "ellipsis" ? (
            <span
              key={`ellipsis-${idx}`}
              className="select-none px-1.5 text-xs text-slate-400"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`flex h-7 min-w-7 items-center justify-center rounded-[7px] px-1.5 text-xs font-semibold transition ${
                p === page
                  ? "bg-[#7C3AED] text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {p}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="btn-secondary px-2.5 py-1.5 text-xs disabled:opacity-40"
        aria-label="Página siguiente"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </nav>
  );
}
