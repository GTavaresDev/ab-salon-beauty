"use client";

import { type ReactNode, createElement } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  createServiceAction,
  deleteServiceAction,
  fetchServicesAction,
  updateServiceAction,
} from "@core/application/query/controller/services/service.controller";
import { ServiceProps } from "@core/application/query/interface/service.entity";
import { useAppShell } from "@/stores/app-shell.store";

export interface ServicesContextType {
  serviceList: ServiceProps[];
  isLoading: boolean;
  handleAddService: (service: {
    name: string;
    duration: number;
    description?: string;
    price?: number;
    status?: "Ativo" | "Inativo";
    color?: string;
  }) => Promise<void>;
  handleUpdateService: (id: string, data: Partial<ServiceProps>) => Promise<void>;
  handleDeleteService: (id: string) => Promise<void>;
}

export const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export function useServicesState(): ServicesContextType {
  const { currentUser, showToast } = useAppShell();
  const [serviceList, setServiceList] = useState<ServiceProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    fetchServicesAction()
      .then((services) => {
        if (!cancelled && services) setServiceList(services);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  async function refreshServices() {
    const services = await fetchServicesAction();
    setServiceList(services);
  }

  async function handleAddService(service: {
    name: string;
    duration: number;
    description?: string;
    price?: number;
    status?: "Ativo" | "Inativo";
    color?: string;
  }) {
    const res = await createServiceAction(service);
    if (res.success) {
      await refreshServices();
    } else {
      throw new Error(res.error || "Erro ao cadastrar serviço.");
    }
  }

  async function handleUpdateService(id: string, data: Partial<ServiceProps>) {
    const res = await updateServiceAction({ id, ...data });
    if (res.success) {
      await refreshServices();
    } else {
      showToast(res.error || "Erro ao atualizar serviço.");
    }
  }

  async function handleDeleteService(id: string) {
    const res = await deleteServiceAction(id);
    if (res.success) {
      await refreshServices();
    } else {
      showToast(res.error || "Erro ao excluir serviço.");
    }
  }

  return { serviceList, isLoading, handleAddService, handleUpdateService, handleDeleteService };
}

export function useServices() {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error("useServices must be used within a ServicesProvider");
  }
  return context;
}

export function ServicesProvider({ children }: { children: ReactNode }) {
  const value = useServicesState();
  return createElement(ServicesContext.Provider, { value }, children);
}
