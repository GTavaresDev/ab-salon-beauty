"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { AppointmentProps } from "@core/application/query/interface/appointment.entity";
import { appointmentAttendantLabel } from "@/lib/appointment-attendant";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";

export function SurveySuggestionModal({ appointment, onClose }: {
  appointment: AppointmentProps;
  onClose: () => void;
}) {
  const attendant = appointmentAttendantLabel(appointment);
  const date = new Date(`${appointment.date}T12:00:00`).toLocaleDateString("pt-BR");
  const portalBase = "https://cliente.absalonbeauty.com.br";
  const message = `Olá, ${appointment.name}! Gostaríamos de saber como você avalia o atendimento de ${attendant} em ${date}. Deixe uma nota de 1 a 5 do seu nível de satisfação.\n\nOpções: 1, 2, 3, 4 ou 5.\n\nAvalie pelo portal: ${portalBase}/cliente/painel?avaliar=${appointment.id}`;

  function send() {
    const phone = (appointment.clientPhone ?? "").replace(/\D/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
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
          <Button variant="outline" onClick={onClose}>Agora não</Button>
          <Button disabled={!appointment.clientPhone} onClick={send}>Enviar pesquisa</Button>
        </div>
        {!appointment.clientPhone ? <p className="mt-2 text-right text-xs text-rose-600">Este cliente não tem telefone cadastrado.</p> : null}
      </section>
    </div>
  );
}
