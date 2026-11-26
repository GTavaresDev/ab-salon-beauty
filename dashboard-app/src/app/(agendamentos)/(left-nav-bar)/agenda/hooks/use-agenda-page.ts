"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppShell } from "@/stores/app-shell.store";
import { useAppointments } from "@/app/(agendamentos)/(left-nav-bar)/agenda/hooks/use-appointments";
import { useUsers } from "@/app/(agendamentos)/(left-nav-bar)/usuarios/hooks/use-users";
import { useClients } from "@/app/(agendamentos)/(left-nav-bar)/clientes/hooks/use-clients";
import { useServices } from "@/app/(agendamentos)/(left-nav-bar)/servicos/hooks/use-services";
import { useScrollLock } from "@/lib/use-scroll-lock";

export function useAgendaPage() {
  const { currentUser, showToast } = useAppShell();
  const {
    appointmentList,
    isLoading: appointmentsLoading,
    handleAppointmentStatusChange,
  } = useAppointments();
  const { userList, isLoading: usersLoading } = useUsers();
  const { isLoading: clientsLoading } = useClients();
  const { isLoading: servicesLoading } = useServices();

  const searchParams = useSearchParams();
  const [modal, setModal] = useState(searchParams.get("novo") === "1");

  useScrollLock(modal);
  return {
    currentUser,
    showToast,
    appointmentList,
    appointmentsLoading,
    handleAppointmentStatusChange,
    userList,
    usersLoading,
    clientsLoading,
    servicesLoading,
    modal,
    setModal,
  };
}
