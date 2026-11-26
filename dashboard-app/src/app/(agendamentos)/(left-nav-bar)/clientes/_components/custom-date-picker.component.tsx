"use client";

import { useCustomDatePicker } from "../hooks/use-custom-date-picker";
import { CalendarDays, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function CustomDatePicker({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const {
    open,
    setOpen,
    parsed,
    setSelectedYear,
    setSelectedMonth,
    currentYear,
    currentMonth,
    months,
    years,
    daysInMonth,
    formattedDisplay,
    selectDay,
  } = useCustomDatePicker({ name, value, onChange });

  return (
    <div className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-11 w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:border-zinc-300 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
      >
        <CalendarDays className="size-4 shrink-0 text-zinc-400" />
        <span
          className={
            formattedDisplay
              ? "font-medium text-zinc-900"
              : "font-normal text-zinc-400"
          }
        >
          {formattedDisplay || "Selecione a data de nascimento"}
        </span>
        <ChevronDown className="ml-auto size-4 text-zinc-400" />
      </button>

      {open && (
        <div
          className="fixed inset-0 lg:left-64 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-[310px] rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="mb-2.5 flex items-center justify-between border-b border-zinc-100 pb-2">
              <span className="text-xs font-semibold text-zinc-900">
                Selecione a data
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-950"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mb-2.5 flex items-center gap-1.5">
              <select
                value={currentMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="h-8 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2 text-xs font-semibold text-zinc-800 outline-none hover:bg-zinc-100"
              >
                {months.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={currentYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="h-8 w-20 rounded-lg border border-zinc-200 bg-zinc-50 px-2 text-xs font-semibold text-zinc-800 outline-none hover:bg-zinc-100"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-semibold uppercase text-zinc-400">
              <span>D</span>
              <span>S</span>
              <span>T</span>
              <span>Q</span>
              <span>Q</span>
              <span>S</span>
              <span>S</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isSelected =
                  parsed.year === currentYear &&
                  parsed.month === currentMonth &&
                  parsed.day === dayNum &&
                  Boolean(value);

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => selectDay(dayNum)}
                    className={cn(
                      "flex size-7 items-center justify-center rounded-lg text-xs font-medium transition",
                      isSelected
                        ? "bg-zinc-950 font-bold text-white shadow-sm"
                        : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950",
                    )}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 flex items-center justify-between border-t border-zinc-100 pt-2">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="text-xs font-medium text-zinc-400 hover:text-zinc-600"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-zinc-950 hover:underline"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
