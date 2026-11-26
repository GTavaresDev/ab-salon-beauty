"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getLastAppointmentForClient } from "@/lib/client-appointments";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { paginateItems } from "@/lib/pagination";
import { useAppShell } from "@/stores/app-shell.store";
import { useAppointments } from "@/app/(agendamentos)/(left-nav-bar)/agenda/hooks/use-appointments";
import { useClients } from "@/app/(agendamentos)/(left-nav-bar)/clientes/hooks/use-clients";
import { ClientProps } from "@core/application/query/interface/client.entity";

export function useClientsView() {
  const searchParams = useSearchParams();
  const {
    clientList,
    isLoading,
    handleAddClient,
    handleReplaceClient,
    handleUpdateClient,
    handleDeleteClient,
  } = useClients();
  const { appointmentList, isLoading: appointmentsLoading } = useAppointments();
  const { currentUser, showToast } = useAppShell();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [modal, setModal] = useState(searchParams.get("novo") === "1");
  const [editingClient, setEditingClient] = useState<ClientProps | null>(null);
  const [page, setPage] = useState(1);

  useScrollLock(modal || !!editingClient);

  const filtered = useMemo(() => {
    return clientList.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        String(c.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
        false;
      const matchStatus = statusFilter === "Todos" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [clientList, search, statusFilter]);

  const pagedClients = useMemo(
    () => paginateItems(filtered, page),
    [filtered, page],
  );


  const totalClients = clientList.length;
  const activeClients = clientList.filter((c) => c.status === "Ativo").length;
  const clientsWithAppointments = useMemo(() => {
    return clientList.filter((c) => Boolean(c?.name) && getLastAppointmentForClient(appointmentList, c) !== null).length;
  }, [clientList, appointmentList]);
  const inactiveClients = clientList.filter((c) => c.status === "Inativo").length;
  return {
    isLoading,
    handleAddClient,
    handleReplaceClient,
    handleUpdateClient,
    handleDeleteClient,
    appointmentList,
    appointmentsLoading,
    currentUser,
    showToast,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    modal,
    setModal,
    editingClient,
    setEditingClient,
    page,
    setPage,
    filtered,
    totalClients,
    activeClients,
    clientsWithAppointments,
    inactiveClients,
  };
}
