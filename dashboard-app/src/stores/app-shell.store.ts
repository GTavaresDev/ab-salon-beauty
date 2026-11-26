"use client";

import { type ReactNode, useEffect } from "react";
import { create } from "zustand";
import { getCurrentSessionAction, logoutAction, startImpersonationAction, stopImpersonationAction, type SessionUser } from "@core/application/query/controller/users/auth.controller";
import { resetPendingNotificationDismissed } from "@/app/(agendamentos)/(left-nav-bar)/dashboard/lib/pending-notification-storage";

export interface PageHeaderOverride { title: string; subtitle: string }
export interface AppShellState {
  currentUser: SessionUser | null; isBootstrapping: boolean; mobileOpen: boolean; toast: string | null;
  allowPastBooking: boolean; initialEditUserId: string | null; pageHeader: PageHeaderOverride | null;
  setMobileOpen: (value: boolean) => void; showToast: (message: string) => void;
  setAllowPastBooking: (value: boolean) => void; setInitialEditUserId: (value: string | null) => void;
  setPageHeader: (value: PageHeaderOverride | null) => void; bootstrap: () => Promise<void>;
  handleStartImpersonation: (id: string) => Promise<void>; handleStopImpersonation: () => Promise<void>; handleLogout: () => Promise<void>;
}

export const useAppShellStore = create<AppShellState>((set, get) => ({
  currentUser: null, isBootstrapping: true, mobileOpen: false, toast: null, allowPastBooking: false,
  initialEditUserId: null, pageHeader: null,
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
  showToast: (toast) => { set({ toast }); window.setTimeout(() => set({ toast: null }), 3500); },
  setAllowPastBooking: (allowPastBooking) => set({ allowPastBooking }),
  setInitialEditUserId: (initialEditUserId) => set({ initialEditUserId }),
  setPageHeader: (pageHeader) => set({ pageHeader }),
  bootstrap: async () => { const currentUser = await getCurrentSessionAction(); if (!currentUser) { window.location.assign("/login"); return; } set({ currentUser, isBootstrapping: false }); },
  handleStartImpersonation: async (id) => { const result = await startImpersonationAction(id); if (result.success) window.location.reload(); else get().showToast(result.error || "Erro ao assumir usuário."); },
  handleStopImpersonation: async () => { const result = await stopImpersonationAction(); if (result.success) window.location.reload(); else get().showToast(result.error || "Erro ao sair da conta."); },
  handleLogout: async () => { resetPendingNotificationDismissed(); await logoutAction(); },
}));

export function useAppShell() { return useAppShellStore(); }
export function AppShellProvider({ children }: { children: ReactNode }) { const bootstrap = useAppShellStore((state) => state.bootstrap); useEffect(() => { void bootstrap(); }, [bootstrap]); return children; }
