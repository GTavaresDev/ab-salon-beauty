"use client";

import { FormEvent, useMemo, useState } from "react";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { ProductProps } from "@core/application/query/interface/product.entity";
import { type ExtendedSale, type PaymentMethod } from "../_components/sales.component";

export function useEditSaleDialog({
  saleId,
  onClose,
  saleList,
  productList,
  showToast,
  onUpdateSale,
}: {
  saleId: string | null;
  onClose: () => void;
  saleList: ExtendedSale[];
  productList: (ProductProps & { formattedPrice?: string })[];
  showToast: (message: string) => void;
  onUpdateSale: (
    id: string,
    sale: { quantity?: number; unitPrice?: number; paymentMethod?: PaymentMethod },
    password: string
  ) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [editFormQuantity, setEditFormQuantity] = useState("");
  const [editFormUnitPrice, setEditFormUnitPrice] = useState("");

  useScrollLock(!!saleId);

  const editSale = useMemo(() => {
    return saleId ? saleList.find((s) => s.id === saleId) : null;
  }, [saleId, saleList]);

  const editProduct = useMemo(() => {
    return editSale ? productList.find((p) => p.id === editSale.productId) : null;
  }, [editSale, productList]);

  const editTotalSale = useMemo(() => {
    if (!editFormQuantity || !editFormUnitPrice) return 0;
    const quantity = Number(editFormQuantity);
    const unitPrice = Number(editFormUnitPrice);
    return quantity * unitPrice;
  }, [editFormQuantity, editFormUnitPrice]);

  function handleClose() {
    onClose();
    setAdminPassword("");
    setEditFormQuantity("");
    setEditFormUnitPrice("");
  }

  async function handleEdit(id: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const quantity = editFormQuantity ? Number(editFormQuantity) : Number(form.get("quantity"));
    const unitPrice = editFormUnitPrice ? Number(editFormUnitPrice) : Number(form.get("unitPrice"));
    const paymentMethod = String(form.get("paymentMethod")) as PaymentMethod;
    const password = String(form.get("password"));

    try {
      if (quantity <= 0) {
        throw new Error("Quantidade deve ser maior que zero.");
      }
      if (unitPrice <= 0) {
        throw new Error("Preço unitário deve ser maior que zero.");
      }

      await onUpdateSale(id, { quantity, unitPrice, paymentMethod }, password);
      onClose();
      setAdminPassword("");
      setEditFormQuantity("");
      setEditFormUnitPrice("");
      showToast("Venda atualizada.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar.";
      showToast(message);
    } finally {
      setLoading(false);
    }
  }
  return {
    loading,
    adminPassword,
    setAdminPassword,
    editFormQuantity,
    setEditFormQuantity,
    editFormUnitPrice,
    setEditFormUnitPrice,
    editSale,
    editProduct,
    editTotalSale,
    handleClose,
    handleEdit,
  };
}
