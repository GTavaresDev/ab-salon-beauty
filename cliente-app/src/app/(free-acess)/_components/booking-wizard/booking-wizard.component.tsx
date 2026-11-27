"use client";

import { useBookingWizardView } from "../hooks/use-booking-wizard";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronRight,
  CircleCheck,
  ClipboardList,
  Clock,
  UserRound,
} from "lucide-react";
import type { ClientAppointmentDTO } from "@core/application/interfaces/appointments/client-appointment";
import { Avatar } from "@/components/portal-ui/avatar.component";
import { Button } from "@/components/portal-ui/button.component";
import { cn } from "@/lib/utils";
import {
  formatDate,
  formatDayNumber,
  formatFriendlyDate,
  formatMonthShort,
  formatShortWeekday,
  isToday,
} from "../portal-format/portal-format";
import { STEP_ORDER, type BookingWizardProps } from "./booking-wizard.types";

const STEP_META = [
  { label: "Serviço", Icon: ClipboardList },
  { label: "Profissional", Icon: UserRound },
  { label: "Data", Icon: CalendarDays },
  { label: "Horário", Icon: Clock },
  { label: "Confirmar", Icon: CircleCheck },
];

export function BookingWizard({ flow }: BookingWizardProps) {
  const {
    services,
    step,
    stepIndex,
    loading,
    error,
    service,
    professional,
    date,
    time,
    professionals,
    dates,
    times,
    booked,
    selectService,
    selectProfessional,
    selectDate,
    selectTime,
    confirm,
    goBack,
    title,
    subtitle,
  } = useBookingWizardView({ flow });

  if (step === "sucesso" && booked) {
    return <BookingSuccess appointment={booked} />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-7">
        {stepIndex > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#7A3350] transition hover:text-[#3D0F22]"
          >
            <ArrowLeft className="size-4" /> Voltar
          </button>
        ) : null}

        <div className="mb-7 grid grid-cols-5 gap-1.5 rounded-2xl border border-[#E7C5CF] bg-white p-3 shadow-[0_1px_2px_rgba(92,26,51,0.04)]">
          {STEP_ORDER.map((item, index) => {
            const { label, Icon } = STEP_META[index];
            const isActive = index === stepIndex;
            const isComplete = index < stepIndex;

            return (
            <div
              key={item}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-1 py-2.5 text-center transition sm:py-3",
                isActive
                  ? "bg-[#5C1A33] text-white shadow-sm"
                  : isComplete
                    ? "bg-[#FCE8EE] text-[#5C1A33]"
                    : "text-[#7A3350]",
              )}
            >
              <Icon className="size-4 sm:size-[18px]" />
              <span className="truncate text-[10px] font-medium sm:text-xs">{label}</span>
            </div>
            );
          })}
        </div>

        <h1 className="text-xl font-semibold tracking-[-0.02em] text-[#3D0F22] sm:text-2xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-[#7A3350]">{subtitle}</p>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? <p className="text-sm text-[#7A3350]">Carregando...</p> : null}

      {!loading && step === "servico" ? (
        <ul className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {services.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => selectService(item)}
                className="flex h-full min-h-24 w-full items-start justify-between gap-3 rounded-2xl border border-[#E7C5CF] bg-white p-4 text-left transition hover:border-[#9B4A68] hover:shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#3D0F22]">{item.name}</p>
                  {item.description ? (
                    <p className="mt-1 line-clamp-2 text-xs text-[#7A3350]">
                      {item.description}
                    </p>
                  ) : null}
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#7A3350]">
                    <Clock className="size-3.5" />
                    {item.durationMinutes} min
                  </p>
                </div>
                <ChevronRight className="mt-0.5 size-4 shrink-0 text-[#B98A9C]" />
              </button>
            </li>
          ))}
          {services.length === 0 ? (
            <li className="col-span-full rounded-2xl border border-dashed border-[#DDAFBD] p-6 text-center text-sm text-[#7A3350]">
              Nenhum serviço disponível para agendamento no momento.
            </li>
          ) : null}
        </ul>
      ) : null}

      {!loading && step === "profissional" ? (
        <ul className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {professionals.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => selectProfessional(item)}
                className="flex w-full items-center gap-3 rounded-2xl border border-[#E7C5CF] bg-white p-4 text-left transition hover:border-[#9B4A68] hover:shadow-sm"
              >
                <Avatar initials={item.initials} />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#3D0F22]">
                  {item.name}
                </span>
                <ChevronRight className="size-4 shrink-0 text-[#B98A9C]" />
              </button>
            </li>
          ))}
          {professionals.length === 0 ? (
            <li className="col-span-full rounded-2xl border border-dashed border-[#DDAFBD] p-6 text-center text-sm text-[#7A3350]">
              Nenhum profissional disponível para este serviço.
            </li>
          ) : null}
        </ul>
      ) : null}

      {!loading && step === "data" ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-7 w-full">
          {dates.map((item) => {
            const todayItem = isToday(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => selectDate(item)}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-xl border py-2.5 transition",
                  todayItem
                    ? "border-[#5C1A33] bg-[#5C1A33] text-white shadow-sm ring-2 ring-[#5C1A33]/20 hover:bg-[#3D0F22]"
                    : "border-[#E7C5CF] bg-white text-[#3D0F22] hover:border-[#9B4A68] hover:shadow-xs",
                )}
              >
                {todayItem ? (
                  <span className="mb-0.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                    Hoje
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold uppercase text-[#B98A9C]">
                    {formatShortWeekday(item)}
                  </span>
                )}
                <span className={cn("text-lg font-bold leading-tight", todayItem ? "text-white" : "text-[#3D0F22]")}>
                  {formatDayNumber(item)}
                </span>
                <span className={cn("text-[11px]", todayItem ? "font-medium text-[#F8D9E2]" : "text-[#9B4A68]")}>
                  {formatMonthShort(item)}
                </span>
              </button>
            );
          })}
          {dates.length === 0 ? (
            <p className="col-span-full rounded-2xl border border-dashed border-[#DDAFBD] p-6 text-center text-sm text-[#7A3350]">
              Não há datas com horários livres nos próximos dias.
            </p>
          ) : null}
        </div>
      ) : null}

      {!loading && step === "horario" ? (
        <div>
          <p className="mb-3 text-sm font-medium text-[#5C1A33]">
            {formatFriendlyDate(date)}
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {times.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => selectTime(item)}
                className="rounded-xl border border-[#E7C5CF] bg-white py-3 text-sm font-semibold text-[#3D0F22] transition hover:border-[#9B4A68] hover:bg-[#FFF4F7]"
              >
                {item}
              </button>
            ))}
          </div>
          {times.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#DDAFBD] p-6 text-center text-sm text-[#7A3350]">
              Nenhum horário livre nesta data. Escolha outro dia.
            </p>
          ) : null}
        </div>
      ) : null}

      {!loading && step === "confirmacao" && service && professional ? (
        <div>
          <dl className="divide-y divide-[#F3E3E8] rounded-2xl border border-[#E7C5CF] bg-white">
            <SummaryRow label="Serviço" value={service.name} />
            <SummaryRow label="Duração" value={`${service.durationMinutes} minutos`} />
            <SummaryRow label="Profissional" value={professional.name} />
            <SummaryRow label="Data" value={formatDate(date)} />
            <SummaryRow label="Horário" value={time} />
          </dl>

          <Button className="mt-6 w-full" size="lg" onClick={confirm} disabled={loading}>
            {loading ? "Confirmando..." : "Confirmar agendamento"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <dt className="text-sm text-[#7A3350]">{label}</dt>
      <dd className="text-right text-sm font-semibold text-[#3D0F22]">{value}</dd>
    </div>
  );
}

function BookingSuccess({ appointment }: { appointment: ClientAppointmentDTO }) {
  return (
    <div className="text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#5C1A33] text-white">
        <Check className="size-7" />
      </span>

      <h1 className="mt-5 text-2xl font-semibold tracking-[-0.02em] text-[#3D0F22]">
        Agendamento realizado!
      </h1>
      <p className="mt-2 text-sm text-[#7A3350]">
        Seu horário está reservado. A clínica confirmará em breve.
      </p>

      <div className="mt-6 rounded-2xl border border-[#E7C5CF] bg-white p-5 text-left">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#3D0F22]">
          <CalendarCheck className="size-4" />
          {appointment.serviceName}
        </p>
        <p className="mt-2 text-sm text-[#7A3350]">
          {formatDate(appointment.date)} às {appointment.time}
        </p>
        <p className="text-sm text-[#7A3350]">{appointment.duration}</p>
        {appointment.professionalName ? (
          <p className="mt-1 text-sm text-[#7A3350]">{appointment.professionalName}</p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button className="w-full" size="lg" asChild>
          <Link href="/cliente/painel/meus-agendamentos">Ver meus agendamentos</Link>
        </Button>
        <Button className="w-full" size="lg" variant="outline" asChild>
          <Link href="/cliente/painel">Voltar para início</Link>
        </Button>
      </div>
    </div>
  );
}
