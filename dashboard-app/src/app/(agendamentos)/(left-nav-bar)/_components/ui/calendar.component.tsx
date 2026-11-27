"use client";

import { type ComponentProps } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DayButtonProps } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button.component";

export type CalendarProps = ComponentProps<typeof DayPicker> & {
  /** Dates (yyyy-MM-dd) that should render an appointment indicator dot. */
  markedDates?: Set<string>;
};

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  markedDates,
  ...props
}: DayButtonProps & { markedDates?: Set<string> }) {
  const hasAppointment = markedDates?.has(toIsoDate(day.date));

  return (
    <button
      type="button"
      data-selected={modifiers.selected || undefined}
      data-today={modifiers.today || undefined}
      data-outside={modifiers.outside || undefined}
      className={cn(
        "relative flex size-9 items-center justify-center rounded-lg text-sm font-medium text-[#7A3350] outline-none transition hover:bg-[#FCE8EE] focus-visible:ring-2 focus-visible:ring-[#9B4A68]/30 disabled:pointer-events-none disabled:text-zinc-300",
        "data-[outside=true]:text-zinc-300",
        "data-[today=true]:border data-[today=true]:border-[#9B4A68] data-[today=true]:font-semibold data-[today=true]:text-[#5C1A33]",
        "data-[selected=true]:bg-[#5C1A33] data-[selected=true]:text-white data-[selected=true]:shadow-sm data-[selected=true]:hover:bg-[#3D0F22]",
        "data-[selected=true]:data-[today=true]:border-transparent data-[selected=true]:data-[today=true]:text-white",
        className,
      )}
      {...props}
    >
      {day.date.getDate()}
      {hasAppointment && (
        <span
          className={cn(
            "absolute bottom-1 size-1 rounded-full bg-[#B8912F]",
            modifiers.selected && "bg-white",
          )}
        />
      )}
    </button>
  );
}

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  markedDates,
  components,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={ptBR}
      className={cn("w-full p-1", className)}
      classNames={{
        months: "relative flex w-full flex-col gap-4",
        month: "w-full space-y-3",
        month_caption: "flex items-center justify-center pt-1 pb-1",
        caption_label: "text-sm font-semibold text-zinc-950 capitalize",
        nav: "flex items-center justify-between absolute inset-x-0 top-0.5",
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-8 text-zinc-500",
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-8 text-zinc-500",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex w-full",
        weekday: "flex-1 text-center text-[11px] font-semibold uppercase text-zinc-400",
        week: "flex w-full mt-1",
        day: "flex flex-1 items-center justify-center p-0",
        outside: "text-zinc-300",
        disabled: "text-zinc-300 opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          ),
        DayButton: (dayButtonProps) => (
          <CalendarDayButton {...dayButtonProps} markedDates={markedDates} />
        ),
        ...components,
      }}
      {...props}
    />
  );
}
