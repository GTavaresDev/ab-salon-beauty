"use client";

import { useMemo, useState } from "react";
import { useAppShell } from "@/stores/app-shell.store";
import { useProducts } from "@/app/(agendamentos)/(left-nav-bar)/produtos/hooks/use-products";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { paginateItems } from "@/lib/pagination";

export function useProductsView() {
  const { productList, isLoading, handleAddProduct, handleUpdateProduct, handleDeleteProduct } =
    useProducts();
  const { currentUser, showToast } = useAppShell();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);

  useScrollLock(modal);

  const filtered = useMemo(() => {
    return productList.filter((product) => {
      const matchSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "Todos" || product.status === statusFilter;
      const matchCategory =
        categoryFilter === "Todas" || product.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [productList, search, statusFilter, categoryFilter]);

  const pagedProducts = useMemo(
    () => paginateItems(filtered, page),
    [filtered, page],
  );


  const totalProducts = productList.length;
  const totalStock = productList.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const activeProducts = productList.filter((p) => p.status === "Ativo").length;
  const lowStockProducts = productList.filter(
    (p) => p.status === "Baixo estoque" || (p.quantity || 0) <= 5,
  ).length;
  return {
    isLoading,
    handleAddProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    currentUser,
    showToast,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    page,
    setPage,
    modal,
    setModal,
    filtered,
    totalProducts,
    totalStock,
    activeProducts,
    lowStockProducts,
  };
}
