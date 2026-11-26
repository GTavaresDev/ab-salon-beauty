"use client";

import { useMemo, useState } from "react";

export function useCustomDatePicker({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const parsed = useMemo(() => {
    if (value && value.includes("-")) {
      const [y, m, d] = value.split("-").map(Number);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return { year: y, month: m - 1, day: d };
      }
    }
    return { year: 1995, month: 0, day: 15 };
  }, [value]);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const currentYear = selectedYear ?? parsed.year;
  const currentMonth = selectedMonth ?? parsed.month;

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const years = useMemo(() => {
    const currentYearNum = new Date().getFullYear();
    const list = [];
    for (let y = currentYearNum; y >= 1920; y--) {
      list.push(y);
    }
    return list;
  }, []);

  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const formattedDisplay = useMemo(() => {
    if (!value || !value.includes("-")) return "";
    const [y, m, d] = value.split("-");
    if (!y || !m || !d) return "";
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }, [value]);

  function selectDay(d: number) {
    const mStr = String(currentMonth + 1).padStart(2, "0");
    const dStr = String(d).padStart(2, "0");
    onChange(`${currentYear}-${mStr}-${dStr}`);
    setOpen(false);
  }
  return {
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
  };
}
