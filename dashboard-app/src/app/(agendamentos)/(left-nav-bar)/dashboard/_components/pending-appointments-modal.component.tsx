"use client";

import { useOpenPendingAppointmentsModal, type PendingAppointmentsModalProps } from "../hooks/use-open-pending-appointments-modal";
import { useState } from "react";
import { Clock3, X, ArrowRight, BellRing, Phone } from "lucide-react";
import { Avatar } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/avatar.component";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge.component";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card.component";
import { appointmentAttendantLabel } from "@/lib/appointment-attendant";
import { getTodayIsoString } from "@/lib/week-generator";

export function PendingAppointmentsModal(props: PendingAppointmentsModalProps) {
  if (!props.isOpen || !props.pendingAppointments.length) return null;
  return <OpenPendingAppointmentsModal {...props} />;
}

function OpenPendingAppointmentsModal({
  isOpen,
  onClose,
  onReview,
  onConfirm,
  pendingAppointments,
  serviceList = [],
}: PendingAppointmentsModalProps) {
  const {
    isMinimized,
    setIsMinimized,
  } = useOpenPendingAppointmentsModal({ isOpen, onClose, onReview, onConfirm, pendingAppointments, serviceList });
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const confirmSinglePending = async () => {
    const appointment = pendingAppointments[0];
    if (!onConfirm || !appointment || confirmingId) return;
    setConfirmingId(appointment.id);
    try { await onConfirm(appointment); } finally { setConfirmingId(null); }
  };

  if (!isOpen || pendingAppointments.length === 0) return null;

  const todayIso = getTodayIsoString();
  const count = pendingAppointments.length;
  const isSingular = count === 1;

  // Minimized Floating Widget in the Bottom Right Corner (no backdrop, allows full interaction with system)
  if (isMinimized) {
    const message = isSingular
      ? "Você tem 1 agendamento a revisar"
      : `Você tem ${count} agendamentos a revisar`;

    return (
      <div
        className="fixed top-4 right-4 sm:top-auto sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] max-w-95 pointer-events-auto animate-in slide-in-from-top-4 sm:slide-in-from-bottom-4 fade-in duration-200"
        role="region"
        aria-label="Notificação de agendamentos pendentes"
      >
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white/95 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div
              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              onClick={() => setIsMinimized(false)}
              title="Clique para expandir"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-zinc-700">
                <BellRing className="size-4.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-zinc-950 truncate">
                    {isSingular ? "Agendamento pendente" : "Agendamentos pendentes"}
                  </h4>
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 whitespace-nowrap shrink-0">
                    {count}
                  </span>
                </div>
                <p className="text-xs font-medium text-zinc-600 truncate mt-0.5">
                  {message}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-950 shrink-0"
              onClick={onClose}
              title="Fechar notificação"
              aria-label="Fechar"
            >
              <X className="size-3.5" />
            </Button>
          </div>

          <div className="flex items-center justify-end pt-0.5">
            <Button
              type="button"
              size="sm"
              onClick={onReview}
              className="h-7.5 px-3.5 gap-1.5 rounded-lg text-xs font-semibold bg-zinc-950 text-white hover:bg-zinc-800 shadow-xs"
            >
              <span>Revisar</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Centered Modal with Backdrop (Taller height and spacious layout)
  return (
    <div
      className="fixed inset-0 lg:left-64 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onMouseDown={(e) => {
        // Clicking outside / on the backdrop minimizes to the top (mobile) or bottom right (desktop)
        if (e.target === e.currentTarget) {
          setIsMinimized(true);
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pending-appointments-modal-title"
    >
      <Card className="flex w-full max-w-lg max-h-[90dvh] flex-col overflow-hidden rounded-2xl border-zinc-200 shadow-2xl animate-in zoom-in-95 duration-150">
        <CardHeader className="flex-row items-start justify-between gap-4 border-b border-zinc-100 px-5 py-5 sm:px-6 shrink-0">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-700">
              <BellRing className="size-5 sm:size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle
                id="pending-appointments-modal-title"
                className="text-base sm:text-lg font-semibold leading-6 text-zinc-950"
              >
                {isSingular
                  ? "Agendamento aguardando aprovação"
                  : "Agendamentos aguardando aprovação"}
              </CardTitle>
              <p className="mt-1.5 text-sm leading-5 text-zinc-500">
                {isSingular
                  ? "Há 1 novo agendamento realizado por cliente que aguarda sua confirmação."
                  : `Há ${count} novos agendamentos realizados por clientes que aguardam sua confirmação.`}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 -mt-2 shrink-0 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-950"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X className="size-4" />
          </Button>
        </CardHeader>

        <CardContent className="min-h-0 overflow-hidden px-5 py-4 sm:px-6">
          <div className="max-h-[calc(90dvh-17rem)] divide-y divide-zinc-100 overflow-y-auto rounded-xl border border-zinc-200 bg-white thin-scrollbar">
            {pendingAppointments.map((item) => {
              const attendantLabel = appointmentAttendantLabel(item);
              const isToday = item.date === todayIso;
              const formattedDate = isToday
                ? `Hoje às ${item.time}`
                : `${item.date.slice(8, 10)}/${item.date.slice(5, 7)} às ${item.time}`;
              return (
                <div
                  key={item.id}
                  className="p-4 transition-colors hover:bg-zinc-50 sm:p-5"
                >
                  <div className="flex items-start gap-3.5">
                    <Avatar initials={item.initials} className="mt-0.5 size-10 text-sm" />
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-semibold leading-5 text-zinc-950">
                        {item.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs leading-4 text-zinc-600">
                        <span>{item.service || "Atendimento"}</span>
                        <span aria-hidden="true" className="text-zinc-300">·</span>
                        <span>{item.duration}</span>
                      </div>
                      {attendantLabel ? <p className="mt-1 text-xs leading-4 text-zinc-500">Profissional: {attendantLabel}</p> : null}
                      {item.clientPhone && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs leading-4 text-zinc-500">
                          <Phone className="size-3.5 shrink-0" /> <span>{item.clientPhone}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-700">
                        <Clock3 className="size-3.5 text-zinc-500" />
                        {formattedDate}
                      </span>
                      <Badge className="border-amber-300 bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                        Pendente
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col-reverse gap-2.5 border-t border-zinc-100 bg-zinc-50/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReview}
            className="w-full gap-1.5 border-zinc-300 text-xs font-medium text-zinc-700 hover:bg-zinc-100 sm:w-auto"
          >
            <span>Revisar agendamentos</span>
            <ArrowRight className="size-3.5" />
          </Button>
          {onConfirm && pendingAppointments.length === 1 ? (
            <Button
              type="button"
              size="sm"
              onClick={confirmSinglePending}
              disabled={confirmingId !== null}
              className="w-full bg-zinc-950 text-xs font-semibold text-white hover:bg-zinc-800 sm:w-auto"
            >
              {confirmingId === pendingAppointments[0].id ? "Confirmando..." : "Confirmar"}
            </Button>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
}
