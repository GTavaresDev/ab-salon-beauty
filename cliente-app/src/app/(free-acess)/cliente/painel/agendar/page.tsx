import type { Metadata } from "next";
import { loadBookingFlow } from "@core/application/query/controller/booking-flow.controller";
import { BookingWizard } from "../../../_components/booking-wizard/booking-wizard.component";
import { PortalShell, requireCompletePortalSession } from "../../../_components/portal-shell.component";

export const metadata: Metadata = {
  title: "Agendar",
};

export default async function BookingPage() {
  const session = await requireCompletePortalSession();
  const result = await loadBookingFlow();

  return (
    <PortalShell
      session={session}
      title="Novo agendamento"
      subtitle="Escolha o serviço e o horário ideal para o seu atendimento."
    >
      {result.success ? (
        <BookingWizard flow={result.data} />
      ) : (
        <p role="alert" className="rounded-2xl border border-[#E7C5CF] bg-white p-5 text-sm text-[#7A3350]">
          {result.error}
        </p>
      )}
    </PortalShell>
  );
}
