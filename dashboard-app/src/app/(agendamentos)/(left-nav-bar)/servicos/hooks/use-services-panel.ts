"use client";

import { useState } from "react";
import { ServiceProps } from "@core/application/query/interface/service.entity";
import { paginateItems } from "@/lib/pagination";

export interface ServicesProps {
  showToast: (msg: string, type?: "success" | "error") => void;
  serviceList: ServiceProps[];
  onAddService: (data: Omit<ServiceProps, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onUpdateService: (id: string, data: Partial<ServiceProps>) => Promise<void>;
  onDeleteService: (id: string) => Promise<void>;
  canViewMetrics?: boolean;
}

export function useServices({
  showToast,
  serviceList,
  onAddService,
  onUpdateService,
  onDeleteService,
}: ServicesProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [modal, setModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceProps | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = serviceList.filter((s) => {
    const searchMatch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter === "Todos" || s.status === statusFilter;
    return searchMatch && statusMatch;
  });

  const paginatedItems = paginateItems(filtered, page, 10);

  const handleOpenModal = (service?: ServiceProps) => {
    setEditingService(service || null);
    setModal(true);
  };

  const handleCloseModal = () => {
    setModal(false);
    setEditingService(null);
  };

  const handleSave = async (data: Omit<ServiceProps, "id" | "createdAt" | "updatedAt">) => {
    setLoading(true);
    try {
      if (editingService && editingService.id) {
        await onUpdateService(editingService.id, data);
        showToast("Serviço atualizado com sucesso");
      } else {
        await onAddService(data);
        showToast("Serviço criado com sucesso");
      }
      handleCloseModal();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Erro ao salvar serviço", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm("Tem certeza que deseja deletar este serviço?")) return;
    setLoading(true);
    try {
      await onDeleteService(id);
      showToast(`Serviço ${name} excluído do banco`);
      setOpenMenuId(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Erro ao deletar serviço", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (service: ServiceProps) => {
    if (!service.id) return;
    const newStatus = service.status === "Ativo" ? "Inativo" : "Ativo";
    setLoading(true);
    try {
      await onUpdateService(service.id, { status: newStatus as "Ativo" | "Inativo" });
      showToast(`Status de ${service.name} alterado para ${newStatus}`);
      setOpenMenuId(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Erro ao atualizar status", "error");
    } finally {
      setLoading(false);
    }
  };

  const totalServices = serviceList.length;
  const activeServices = serviceList.filter((s) => s.status === "Ativo").length;
  const avgPrice = serviceList.length
    ? serviceList.reduce((acc, s) => acc + (s.price || 0), 0) / serviceList.length
    : 0;
  const avgDuration = serviceList.length
    ? Math.round(serviceList.reduce((acc, s) => acc + (s.duration || 0), 0) / serviceList.length)
    : 0;
  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    modal,
    setModal,
    editingService,
    loading,
    page,
    setPage,
    openMenuId,
    setOpenMenuId,
    filtered,
    paginatedItems,
    handleOpenModal,
    handleSave,
    handleDelete,
    handleToggleStatus,
    totalServices,
    activeServices,
    avgPrice,
    avgDuration,
  };
}
