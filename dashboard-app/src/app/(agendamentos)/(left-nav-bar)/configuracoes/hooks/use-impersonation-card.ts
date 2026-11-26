"use client";

import { useMemo, useState } from "react";
import { paginateItems } from "@/lib/pagination";
import { useAppShell } from "@/stores/app-shell.store";
import { useUsers } from "@/app/(agendamentos)/(left-nav-bar)/usuarios/hooks/use-users";

export function useImpersonationCard() {
  const { currentUser, handleStartImpersonation, handleStopImpersonation } =
    useAppShell();
  const { userList } = useUsers();

  const [userSearch, setUserSearch] = useState("");
  const [page, setPage] = useState(1);
  const [impersonatingLoading, setImpersonatingLoading] = useState(false);

  const availableUsers = useMemo(() => {
    if (!currentUser) return [];
    return userList.filter((u) => u.id !== currentUser.id);
  }, [userList, currentUser]);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return availableUsers;
    const q = userSearch.toLowerCase();
    return availableUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.status && u.status.toLowerCase().includes(q))
    );
  }, [availableUsers, userSearch]);

  const pagedUsers = useMemo(
    () => paginateItems(filteredUsers, page),
    [filteredUsers, page],
  );

  async function onStartImpersonation(targetUserId: string) {
    setImpersonatingLoading(true);
    try {
      await handleStartImpersonation(targetUserId);
    } finally {
      setImpersonatingLoading(false);
    }
  }

  async function onStopImpersonation() {
    setImpersonatingLoading(true);
    try {
      await handleStopImpersonation();
    } finally {
      setImpersonatingLoading(false);
    }
  }
  return {
    currentUser,
    userSearch,
    setUserSearch,
    page,
    setPage,
    impersonatingLoading,
    availableUsers,
    filteredUsers,
    pagedUsers,
    onStartImpersonation,
    onStopImpersonation,
  };
}
