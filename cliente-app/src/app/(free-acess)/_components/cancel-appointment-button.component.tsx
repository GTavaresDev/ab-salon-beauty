"use client";

import { useCancelAppointmentButton } from "../hooks/use-cancel-appointment-button";
import { Button } from "@/components/portal-ui/button.component";

export function CancelAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const {
    confirming,
    setConfirming,
    loading,
    error,
    cancel,
  } = useCancelAppointmentButton({ appointmentId });

  if (!confirming) {
    return (
      <div>
        <Button variant="outline" className="w-full" onClick={() => setConfirming(true)}>
          Cancelar agendamento
        </Button>
        {error ? (
          <p className="mt-3 text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <p className="text-sm font-semibold text-zinc-950">Cancelar este agendamento?</p>
      <p className="mt-1 text-sm text-zinc-500">
        Essa ação não pode ser desfeita. Para remarcar, faça um novo agendamento.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button className="w-full" onClick={cancel} disabled={loading}>
          {loading ? "Cancelando..." : "Sim, cancelar"}
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => setConfirming(false)}
          disabled={loading}
        >
          Manter agendamento
        </Button>
      </div>
    </div>
  );
}
