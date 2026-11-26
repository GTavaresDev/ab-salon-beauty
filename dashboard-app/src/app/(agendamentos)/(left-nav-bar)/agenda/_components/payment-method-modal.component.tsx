"use client";

import { useState } from "react";
import { CreditCard, X } from "lucide-react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import type { AppointmentProps } from "@core/application/query/interface/appointment.entity";

export type AppointmentPaymentMethod = "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência" | "Outro";

const paymentMethods: AppointmentPaymentMethod[] = ["Pix", "Dinheiro", "Crédito", "Débito", "Transferência", "Outro"];

export function PaymentMethodModal({
  appointment,
  onClose,
  onSubmit,
}: {
  appointment: AppointmentProps;
  onClose: () => void;
  onSubmit: (paymentMethod: AppointmentPaymentMethod) => Promise<boolean>;
}) {
  const [paymentMethod, setPaymentMethod] = useState<AppointmentPaymentMethod | "">(appointment.paymentMethod ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!paymentMethod || isSaving) return;
    setIsSaving(true);
    setError("");
    try {
      if (await onSubmit(paymentMethod)) onClose();
      else setError("Não foi possível concluir. Confira sua conexão e tente novamente.");
    } catch {
      setError("Não foi possível concluir. Confira sua conexão e tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="payment-method-title" className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700"><CreditCard className="size-5" /></div>
            <div>
              <h2 id="payment-method-title" className="text-lg font-semibold text-zinc-950">Forma de pagamento</h2>
              <p className="mt-1 text-sm text-zinc-500">Como o cliente pagou este atendimento?</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={isSaving} aria-label="Fechar" className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 disabled:opacity-50"><X className="size-4" /></button>
        </div>

        <label htmlFor="appointment-payment-method" className="mt-5 block text-sm font-medium text-zinc-700">Método de pagamento</label>
        <select id="appointment-payment-method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as AppointmentPaymentMethod | "")} className="mt-2 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200">
          <option value="" disabled>Selecione uma forma de pagamento</option>
          {paymentMethods.map((method) => <option key={method} value={method}>{method}</option>)}
        </select>
        {error ? <p role="alert" className="mt-2 text-sm text-rose-600">{error}</p> : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button type="button" onClick={submit} disabled={!paymentMethod || isSaving}>{isSaving ? "Salvando..." : "Concluir atendimento"}</Button>
        </div>
      </section>
    </div>
  );
}
