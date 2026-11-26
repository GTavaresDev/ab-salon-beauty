"use client";

import { useState } from "react";
import { UserProps } from "@core/application/query/interface/user.entity";
import type { StaffRole } from "@core/application/query/interface/user.entity";

export function useUsersTable({
  pagedUsers,
  filteredCount,
  statusFilter = "Todos",
  onStatusFilterChange,
  roleFilter = "Todos",
  onRoleFilterChange,
  page,
  onPageChange,
  currentUserRole,
  canEditUser,
  onEditUser,
  onUpdateUser,
  onDeleteUser,
  showToast,
}: {
  pagedUsers: UserProps[];
  filteredCount: number;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  roleFilter?: string;
  onRoleFilterChange?: (role: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  currentUserRole: StaffRole;
  canEditUser: (user: UserProps) => boolean;
  onEditUser: (user: UserProps) => void;
  onUpdateUser: (id: string, status: "Ativo" | "Inativo") => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  showToast: (message: string) => void;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  return {
    openMenuId,
    setOpenMenuId,
  };
}
