"use client";

import { useAppShell } from "@/stores/app-shell.store";

export function useSettingsView() {
  const { currentUser } = useAppShell();
  return {
    currentUser,
  };
}
