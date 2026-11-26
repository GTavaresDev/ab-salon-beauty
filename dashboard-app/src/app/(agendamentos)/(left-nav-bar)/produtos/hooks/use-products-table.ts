"use client";

import { useState } from "react";
import { ProductProps } from "@core/application/query/interface/product.entity";

export function useProductsTable({
  products,
  totalItems,
  statusFilter = "Todos",
  onStatusFilterChange,
  categoryFilter = "Todas",
  onCategoryFilterChange,
  page,
  onPageChange,
  showToast,
  onUpdateProduct,
  onDeleteProduct,
}: {
  products: (ProductProps & { formattedPrice?: string })[];
  totalItems: number;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  categoryFilter?: string;
  onCategoryFilterChange?: (cat: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  showToast: (message: string) => void;
  onUpdateProduct: (id: string, status: "Ativo" | "Inativo" | "Baixo estoque") => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  return {
    openMenuId,
    setOpenMenuId,
  };
}
