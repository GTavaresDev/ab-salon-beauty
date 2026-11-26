import { type ReactNode } from "react";
import { AppShellProvider } from "@/stores/app-shell.store";
import { ShellLayout } from "./_components/shell-layout.component";
import { ClientsProvider } from "./clientes/hooks/use-clients";
import { ServicesProvider } from "./servicos/hooks/use-services";
import { AppointmentsProvider } from "./agenda/hooks/use-appointments";

export default function LeftNavBarLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppShellProvider>
      <ClientsProvider>
        <ServicesProvider>
          <AppointmentsProvider>
            <ShellLayout>{children}</ShellLayout>
          </AppointmentsProvider>
        </ServicesProvider>
      </ClientsProvider>
    </AppShellProvider>
  );
}
