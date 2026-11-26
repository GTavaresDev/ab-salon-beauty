"use client";

import { useCreateAppointmentDialog } from "../hooks/use-create-appointment-dialog";

import { ChevronDown, ChevronLeft, ChevronRight, CircleUserRound, X } from "lucide-react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card.component";
import { FieldLabel } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/field-label.component";
import { cn } from "@/lib/utils";
import { appointmentChannels, times } from "@/app/mocks/scheduling";
import { getTodayIsoString } from "@/lib/week-generator";
import { AppointmentProps } from "@core/application/query/interface/appointment.entity";
import { TimeButton } from "./time-button.component";

export function CreateAppointmentDialog({
  appointments,
  onClose,
  showToast,
}: {
  appointments: AppointmentProps[];
  onClose: () => void;
  showToast: (message: string) => void;
}) {
  const {
    clientList,
    serviceList,
    setWeekOffset,
    selectedDay,
    setSelectedDay,
    setSelectedTime,
    setSelectedDuration,
    selectedChannel,
    setSelectedChannel,
    setSelectedClientId,
    setSelectedService,
    notes,
    setNotes,
    loading,
    weekDays,
    selectedClient,
    currentService,
    serviceMinutes,
    selectedDuration,
    activeSelectedTime,
    isTimeDisabled,
    addAppointment,
  } = useCreateAppointmentDialog({ appointments, onClose, showToast });

  return (
    <div
      className="fixed inset-0 lg:left-64 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Novo agendamento"
    >
      <Card className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden shadow-2xl">
        <CardHeader className="flex-row shrink-0 items-start justify-between">
          <div>
            <CardTitle>Novo agendamento</CardTitle>
            <CardDescription>
              Escolha data, duração e horário. Horários passados (tolerância de 5 min) e
              ocupados ficam riscados.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 -mt-2"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X />
          </Button>
        </CardHeader>
        <form onSubmit={addAppointment} className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <FieldLabel>Data</FieldLabel>
              <div className="mb-2 inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-7"
                  onClick={() => setWeekOffset((prev) => prev - 1)}
                  aria-label="Semana anterior"
                >
                  <ChevronLeft />
                </Button>
                <span className="min-w-32 text-center text-xs font-semibold">
                  {weekDays[selectedDay]?.full || "Carregando..."}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-7"
                  onClick={() => setWeekOffset((prev) => prev + 1)}
                  aria-label="Próxima semana"
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {weekDays.map((item, index) => {
                const isToday = item.iso === getTodayIsoString();
                const isSelected = selectedDay === index;

                return (
                  <button
                    key={item.date}
                    type="button"
                    onClick={() => {
                      setSelectedDay(index);
                      setSelectedTime("");
                    }}
                    className={cn(
                      "flex min-h-14 flex-col items-center justify-center rounded-xl border px-1 transition",
                      isSelected
                        ? "border-zinc-950 bg-zinc-950 text-white shadow-md"
                        : isToday
                          ? "border-zinc-950 bg-white text-zinc-950 shadow-md"
                          : "border-transparent bg-zinc-50 text-zinc-500 hover:border-zinc-200 hover:bg-white",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase",
                        isSelected ? "text-zinc-300" : isToday ? "text-zinc-950" : "text-zinc-400",
                      )}
                    >
                      {item.day}
                    </span>
                    <span className="mt-0.5 text-base font-semibold">{item.date}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Cliente</FieldLabel>
                <div className="relative">
                  <CircleUserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                  <select
                    value={selectedClient?.id || ""}
                    onChange={(e) => {
                      setSelectedClientId(e.target.value);
                      setSelectedTime("");
                    }}
                    className="h-11 w-full appearance-none rounded-lg border border-zinc-200 bg-white pl-9 pr-9 text-sm outline-none focus:border-zinc-400"
                  >
                    {clientList.map((c) => (
                      <option key={c.id || c.email} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                    {clientList.length === 0 && (
                      <option value="">Nenhum cliente cadastrado no banco</option>
                    )}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                </div>
              </div>
              <div>
                <FieldLabel>Duração do atendimento</FieldLabel>
                <div className="relative">
                  <select
                    disabled={!!currentService}
                    value={selectedDuration}
                    onChange={(e) => {
                      setSelectedDuration(e.target.value);
                      setSelectedTime("");
                    }}
                    className="h-11 w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3 pr-9 text-sm font-semibold outline-none focus:border-zinc-400"
                  >
                    {serviceMinutes > 90 && <option value="Indisponível">Excede 90 minutos</option>}
                    <option value="30 min">30 min (1 horário)</option>
                    <option value="60 min (1h)">60 min / 1h (2 horários consecutivos)</option>
                    <option value="90 min (1h30)">90 min / 1h30 (3 horários consecutivos)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                </div>
              </div>
              <div>
                <FieldLabel>Serviço</FieldLabel>
                <div className="relative">
                  <select
                    value={currentService?.id ?? ""}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="h-11 w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3 pr-9 text-sm outline-none focus:border-zinc-400"
                  >
                    {serviceList && serviceList.length > 0 ? (
                      serviceList.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))
                    ) : (
                      <option>Consulta inicial</option>
                    )}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                </div>
              </div>
              <div>
                <FieldLabel>Canal de atendimento</FieldLabel>
                <div className="relative">
                  <select
                    value={selectedChannel}
                    onChange={(event) => setSelectedChannel(event.target.value)}
                    className="h-11 w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3 pr-9 text-sm outline-none focus:border-zinc-400"
                  >
                    {appointmentChannels.map((channel) => (
                      <option key={channel.id} value={channel.id}>
                        {channel.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                </div>
              </div>
            </div>

            <div>
              <FieldLabel>Horário</FieldLabel>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {times.map((time) => (
                  <TimeButton
                    key={time}
                    time={time}
                    selected={activeSelectedTime === time}
                    disabled={isTimeDisabled(time)}
                    onClick={() => setSelectedTime(time)}
                  />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Observações</FieldLabel>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione informações importantes..."
                className="min-h-20 w-full resize-none rounded-lg border border-zinc-200 bg-white p-3 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-950/5"
              />
            </div>

            <div className="flex flex-col justify-end gap-2 pt-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!activeSelectedTime || loading}>
                {loading ? "Salvando no banco..." : "Confirmar agendamento"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
