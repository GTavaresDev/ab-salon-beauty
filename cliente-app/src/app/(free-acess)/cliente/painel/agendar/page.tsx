import type { Metadata } from "next";
import { getServicesController } from "@core/application/query/controller/get-services.controller";
import { BookingWizard } from "../../../_components/booking-wizard/booking-wizard.component";
import { PortalShell, requireCompletePortalSession } from "../../../_components/portal-shell.component";

export const metadata: Metadata = {
  title: "Agendar",
};

export default async function BookingPage() {
  const session = await requireCompletePortalSession();
  // Serviços chegam sem preço: o DTO do portal não carrega valores.
  const result = await getServicesController();

  return (
    <PortalShell
      session={session}
      title="Novo agendamento"
      subtitle="Escolha o serviço e o horário ideal para o seu atendimento."
    >
      {result.success ? (
        <BookingWizard services={result.data} />
      ) : (
        <p role="alert" className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-700">
          {result.error}
        </p>
      )}
    </PortalShell>
  );
}
