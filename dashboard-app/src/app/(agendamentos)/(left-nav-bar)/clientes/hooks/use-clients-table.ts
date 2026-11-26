"use client";

import { useState } from "react";
import { ClientProps } from "@core/application/query/interface/client.entity";
import { AppointmentProps } from "@core/application/query/interface/appointment.entity";

export function useClientsTable({
  clients,
  filteredCount,
  statusFilter = "Todos",
  onStatusFilterChange,
  appointmentList,
  page,
  onPageChange,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  clients: ClientProps[];
  filteredCount: number;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  appointmentList: AppointmentProps[];
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (client: ClientProps) => void;
  onToggleStatus: (client: ClientProps) => Promise<void>;
  onDelete: (client: ClientProps) => Promise<void>;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  return {
    openMenuId,
    setOpenMenuId,
  };
}
