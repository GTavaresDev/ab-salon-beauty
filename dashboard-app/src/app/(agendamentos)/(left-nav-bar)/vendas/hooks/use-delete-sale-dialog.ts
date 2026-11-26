"use client";

import { FormEvent, useState } from "react";
import { useScrollLock } from "@/lib/use-scroll-lock";

export function useDeleteSaleDialog({
  saleId,
  onClose,
  showToast,
  onDeleteSale,
}: {
  saleId: string | null;
  onClose: () => void;
  showToast: (message: string) => void;
  onDeleteSale: (id: string, password: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  useScrollLock(!!saleId);

  function handleClose() {
    onClose();
    setAdminPassword("");
  }

  async function handleDelete(id: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));

    try {
      await onDeleteSale(id, password);
      onClose();
      setAdminPassword("");
      showToast("Venda excluída.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao excluir.";
      showToast(message);
    } finally {
      setLoading(false);
    }
  }
  return {
    loading,
    adminPassword,
    setAdminPassword,
    handleClose,
    handleDelete,
  };
}
