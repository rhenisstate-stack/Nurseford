"use client";

interface PerPageSelectProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
}

export default function PerPageSelect({
  value,
  onChange,
  options = [5, 10, 20, 50, 100, 200, 500, 700, 1000, 2000, 5000, 10000],
}: PerPageSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="px-3 py-2 text-sm rounded-md border bg-[var(--content-bg)] text-[var(--text-color)]"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt} / Page
        </option>
      ))}
    </select>
  );
}
