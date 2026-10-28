"use client";

import { ChangeEvent } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
  disabled = false,
}: SearchBarProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const clearInput = () => {
    onChange("");
  };

  return (
    <div className="relative w-full max-w-sm">
      {/* Search Icon */}
      <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none opacity-60 ">
        🔍
      </span>

      <input
        type="text"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          w-full pl-9 pr-9 py-2
          text-[16px] sm:text-sm rounded-md
          border outline-none
          transition
          focus:ring-2 focus:ring-offset-1
          disabled:opacity-50 disabled:cursor-not-allowed
          bg-[var(--content-bg)] text-[var(--text-color)]
        `}
      />

      {/* Clear button (X) */}
      {value && !disabled && (
        <button
          type="button"
          onClick={clearInput}
          className="absolute inset-y-0 right-2 flex items-center justify-center px-2 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>
      )}
    </div>
  );
}
