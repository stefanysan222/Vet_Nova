"use client";

import { useEffect, type RefObject } from "react";

/**
 * Ejecuta `callback` cuando se hace clic fuera del elemento referenciado por `ref`.
 * Útil para cerrar dropdowns/menús al hacer clic en cualquier otro punto de la página.
 */
export function useClickOutside(ref: RefObject<HTMLElement | null>, callback: () => void): void {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (ref.current && !ref.current.contains(target)) {
        callback();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, callback]);
}
