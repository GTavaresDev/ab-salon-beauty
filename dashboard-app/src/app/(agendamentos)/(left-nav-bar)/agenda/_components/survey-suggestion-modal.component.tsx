"use client";

import { X } from "lucide-react";
import type { AppointmentProps } from "@core/application/query/interface/appointment.entity";
import { useState } from "react";
import { buildAppointmentReviewWhatsAppMessage, buildAppointmentReviewWhatsAppUrl } from "@/lib/whatsapp-helper";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";

export function SurveySuggestionModal({ appointment, onClose, onDismiss }: {
  appointment: AppointmentProps;
  onClose: () => void;
  onDismiss: () => Promise<boolean>;
}) {
  const [dismissing, setDismissing] = useState(false);
  const [error, setError] = useState("");
  const message = buildAppointmentReviewWhatsAppMessage({
    appointmentId: appointment.id,
    clientName: appointment.name,
    professionalName: appointment.userName,
    date: appointment.date,
    time: appointment.time,
  });

  function send() {
    const url = buildAppointmentReviewWhatsAppUrl({
      appointmentId: appointment.id,
      phone: appointment.clientPhone,
      clientName: appointment.name,
      professionalName: appointment.userName,
      date: appointment.date,
      time: appointment.time,
    });
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  }

  async function dismiss() {
    if (dismissing) return;
    setDismissing(true);
    setError("");
    try {
      if (await onDismiss()) onClose();
      else setError("Não foi possível dispensar a pesquisa. Tente novamente.");
    } catch {
      setError("Não foi possível dispensar a pesquisa. Tente novamente.");
    } finally {
      setDismissing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="survey-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <h2 id="survey-title" className="text-lg font-semibold text-zinc-950">Enviar pesquisa de satisfação?</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="shrink-0 rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"><X className="size-4" /></button>
        </div>
        <label htmlFor="survey-message" className="sr-only">Texto da pesquisa</label>
        <div id="survey-message" role="textbox" aria-readonly="true" aria-label="Texto da pesquisa" className="mt-4 max-h-56 w-full select-none overflow-y-auto whitespace-pre-wrap rounded-lg border-2 border-black bg-white p-3 text-sm leading-6 text-zinc-700">{message}</div>
        <div className="mt-6 flex flex-col-reverse justify-end gap-2 sm:flex-row">
          <Button variant="outline" onClick={dismiss} disabled={dismissing}>{dismissing ? "Salvando..." : "Agora não"}</Button>
          <Button disabled={!appointment.clientPhone} onClick={send}>Enviar pesquisa</Button>
        </div>
        {!appointment.clientPhone ? <p className="mt-2 text-right text-xs text-rose-600">Este cliente não tem telefone cadastrado.</p> : null}
        {error ? <p role="alert" className="mt-2 text-right text-xs text-rose-600">{error}</p> : null}
      </section>
    </div>
  );
}
