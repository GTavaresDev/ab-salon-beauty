"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { createUserAction, deleteUserAction, fetchUsersAction, updateUserAction } from "@core/application/query/controller/users/user.controller";
import type { UserProps } from "@core/application/query/interface/user.entity";
import { useAppShellStore } from "@/stores/app-shell.store";

type NewUser = { name: string; email: string; phone?: string; password?: string; permissionLevel?: 0 | 1 | 2 | 3 };
interface UsersState { userList: UserProps[]; isLoading: boolean; loadedFor: string | null; load: (id: string) => Promise<void>; add: (user: NewUser) => Promise<void>; replace: (user: UserProps) => void; updateStatus: (id: string, status: "Ativo" | "Inativo") => Promise<void>; remove: (id: string) => Promise<void> }
const useUsersStore = create<UsersState>((set, get) => ({
  userList: [], isLoading: true, loadedFor: null,
  load: async (id) => { if (get().loadedFor === id) return; set({ isLoading: true }); const userList = await fetchUsersAction(); set({ userList, isLoading: false, loadedFor: id }); },
  add: async (user) => { const result = await createUserAction(user); if (!result.success || !result.data) throw new Error(result.error || "Erro ao adicionar usuário."); set({ userList: [result.data, ...get().userList] }); },
  replace: (user) => set({ userList: get().userList.map((item) => item.id === user.id ? user : item) }),
  updateStatus: async (id, status) => { const result = await updateUserAction({ id, status }); if (!result.success || !result.data) throw new Error(result.error || "Erro ao atualizar usuário."); get().replace(result.data); },
  remove: async (id) => { const result = await deleteUserAction(id); if (!result.success) throw new Error(result.error || "Erro ao excluir usuário."); set({ userList: get().userList.filter((item) => item.id !== id) }); },
}));
export function useUsers() {
  const currentUser = useAppShellStore((state) => state.currentUser); const showToast = useAppShellStore((state) => state.showToast); const state = useUsersStore();
  useEffect(() => { if (currentUser) void state.load(currentUser.id); }, [currentUser, state.load]);
  return { userList: state.userList, isLoading: state.isLoading, handleAddUser: state.add, handleUpdateUser: async (id: string, status: "Ativo" | "Inativo") => { try { await state.updateStatus(id, status); } catch (error) { showToast(error instanceof Error ? error.message : "Erro ao atualizar usuário."); } }, handleReplaceUser: state.replace, handleDeleteUser: async (id: string) => { try { await state.remove(id); } catch (error) { showToast(error instanceof Error ? error.message : "Erro ao excluir usuário."); } } };
}

export function UsersProvider({ children }: { children: React.ReactNode }) {
  return children;
}
