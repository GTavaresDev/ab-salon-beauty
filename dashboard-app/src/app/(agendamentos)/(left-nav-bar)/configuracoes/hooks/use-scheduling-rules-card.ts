"use client";

import { useAppShell } from "@/stores/app-shell.store";

export function useSchedulingRulesCard() {
  const { currentUser, allowPastBooking, setAllowPastBooking, showToast } =
    useAppShell();

  const isAdmin =
    currentUser?.permissionLevel === 1 || currentUser?.role === "Administrador";
  return {
    allowPastBooking,
    setAllowPastBooking,
    showToast,
    isAdmin,
  };
}
