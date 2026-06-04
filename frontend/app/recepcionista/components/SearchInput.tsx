"use client";

import { Search, X } from "lucide-react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
}: SearchInputProps) {
  return (
    <div className="flex h-[46px] w-full items-center gap-3 rounded-2xl border border-[#CBD5E1] bg-white px-4 shadow-sm transition-colors focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 dark:border-[#334155] dark:bg-[#111827]">
      <Search className="h-5 w-5 text-[#64748B] dark:text-[#94A3B8]" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-[#10213A] outline-none placeholder:text-[#94A3B8] dark:text-white"
      />
      {value ? (
        <button
          type="button"
          aria-label="Limpiar búsqueda"
          onClick={() => onChange("")}
          className="rounded-full p-1 text-[#94A3B8] transition hover:text-[#2F6BFF]"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

export default SearchInput;
