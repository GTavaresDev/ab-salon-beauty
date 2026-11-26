"use client";

import { useMemo, useState } from "react";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { paginateItems } from "@/lib/pagination";
import { useAppShell } from "@/stores/app-shell.store";
import { useUsers } from "./use-users";
import { UserProps } from "@core/application/query/interface/user.entity";

export function useUsersView() {
  const {
    userList,
    isLoading,
    handleAddUser,
    handleUpdateUser,
    handleReplaceUser,
    handleDeleteUser,
  } = useUsers();
  const { currentUser, initialEditUserId, setInitialEditUserId, showToast } =
    useAppShell();


  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [modal, setModal] = useState(false);
  const [selectedUser, setEditingUser] = useState<UserProps | null>(null);
  const [page, setPage] = useState(1);



  const currentUserRole = currentUser?.role || "Funcionario";

  const canEditUser = (targetUser: UserProps): boolean => {
    if (!currentUser) return false;
    if (currentUserRole === "Administrador") return true;
    if (currentUserRole === "Gestor") {
      return (
        targetUser.role !== "Administrador" && targetUser.role !== "Gestor"
      );
    }
    return false;
  };

  const canEditProfile = (targetUser: UserProps): boolean =>
    canEditUser(targetUser);

  const canEditPermissions = (targetUser: UserProps): boolean => {
    if (currentUserRole !== "Administrador") return false;
    return canEditUser(targetUser);
  };

  const requestedUser = userList.find((user) => user.id === initialEditUserId);
  const editingUser = selectedUser ?? (requestedUser && canEditUser(requestedUser) ? requestedUser : null);
  useScrollLock(modal || !!editingUser);

  const filtered = useMemo(() => {
    return userList.filter((user) => {
      const matchSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "Todos" || user.status === statusFilter;
      const matchRole = roleFilter === "Todos" || user.role === roleFilter;
      return matchSearch && matchStatus && matchRole;
    });
  }, [userList, search, statusFilter, roleFilter]);

  const pagedUsers = useMemo(
    () => paginateItems(filtered, page),
    [filtered, page],
  );


  const totalUsers = userList.length;
  const activeUsers = userList.filter((u) => u.status === "Ativo").length;
  const adminUsers = userList.filter((u) => u.role === "Administrador").length;
  const staffUsers = userList.filter((u) => u.role !== "Administrador").length;
  return {
    userList,
    isLoading,
    handleAddUser,
    handleUpdateUser,
    handleReplaceUser,
    handleDeleteUser,
    currentUser,
    setInitialEditUserId,
    showToast,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    modal,
    setModal,
    setEditingUser,
    page,
    setPage,
    currentUserRole,
    canEditUser,
    canEditProfile,
    canEditPermissions,
    editingUser,
    filtered,
    pagedUsers,
    totalUsers,
    activeUsers,
    adminUsers,
    staffUsers,
  };
}
