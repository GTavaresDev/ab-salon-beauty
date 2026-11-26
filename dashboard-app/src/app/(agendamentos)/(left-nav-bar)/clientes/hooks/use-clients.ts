"use client";

import { type ReactNode, createElement } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  createClientAction,
  deleteClientAction,
  fetchClientsAction,
  updateClientAction,
} from "@core/application/query/controller/clients/client.controller";
import { ClientProps } from "@core/application/query/interface/client.entity";
import { useAppShell } from "@/stores/app-shell.store";

export interface ClientsContextType {
  clientList: ClientProps[];
  isLoading: boolean;
  refreshClients: () => Promise<void>;
  handleAddClient: (client: {
    name: string;
    email: string;
    phone: string;
    birthDate?: string;
  }) => Promise<void>;
  handleReplaceClient: (updated: ClientProps) => void;
  handleUpdateClient: (id: string, status: "Ativo" | "Inativo") => Promise<void>;
  handleDeleteClient: (id: string) => Promise<void>;
}

export const ClientsContext = createContext<ClientsContextType | undefined>(undefined);

export function useClientsState(): ClientsContextType {
  const { currentUser, showToast } = useAppShell();
  const [clientList, setClientList] = useState<ClientProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshClients() {
    const clients = await fetchClientsAction();
    setClientList(clients);
  }

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === "Funcionario" || currentUser.permissionLevel === 3) {
      setClientList([]);
      setIsLoading(false);
      return;
    }
    let cancelled = false;

    fetchClientsAction()
      .then((clients) => {
        if (!cancelled && clients) setClientList(clients);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  async function handleAddClient(client: {
    name: string;
    email: string;
    phone: string;
    birthDate?: string;
  }) {
    const res = await createClientAction(client);
    if (res.success && res.data) {
      setClientList((prev) => [res.data!, ...prev]);
    } else {
      throw new Error(res.error || "Erro ao cadastrar cliente.");
    }
  }

  // Single source of truth for local state updates: replaces the entire
  // client entity with the object returned by the backend.
  function handleReplaceClient(updated: ClientProps) {
    setClientList((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  async function handleUpdateClient(id: string, status: "Ativo" | "Inativo") {
    const res = await updateClientAction({ id, status });
    if (res.success && res.data) {
      handleReplaceClient(res.data);
    } else {
      showToast(res.error || "Erro ao atualizar status do cliente.");
    }
  }

  async function handleDeleteClient(id: string) {
    const res = await deleteClientAction(id);
    if (res.success) {
      setClientList((prev) => prev.filter((c) => c.id !== id));
    } else {
      showToast(res.error || "Erro ao excluir cliente.");
    }
  }

  return { clientList, isLoading, refreshClients, handleAddClient, handleReplaceClient, handleUpdateClient, handleDeleteClient };
}

export function useClients() {
  const context = useContext(ClientsContext);
  if (!context) {
    throw new Error("useClients must be used within a ClientsProvider");
  }
  return context;
}

export function ClientsProvider({ children }: { children: ReactNode }) {
  const value = useClientsState();
  return createElement(ClientsContext.Provider, { value }, children);
}
