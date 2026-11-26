"use client";

import { useState } from "react";

export function useCreateProductDialog({
  open,
  onClose,
  showToast,
  onAddProduct,
}: {
  open: boolean;
  onClose: () => void;
  showToast: (message: string) => void;
  onAddProduct: (prod: {
    name: string;
    category: string;
    price: number;
    quantity: number;
    status?: "Ativo" | "Inativo" | "Baixo estoque";
  }) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  return {
    loading,
    setLoading,
  };
}
