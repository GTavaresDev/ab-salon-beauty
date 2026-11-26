"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductProps } from "@core/application/query/interface/product.entity";
import { SaleProps } from "@core/application/query/interface/sale.entity";

export const PAYMENT_METHODS = ["Pix", "Dinheiro", "Crédito", "Débito", "Transferência"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type ExtendedSale = SaleProps & { formattedTotal: string; formattedUnitPrice: string; productName?: string };

export function useSales({
  showToast,
  saleList,
  productList,
  onAddSale,
  onUpdateSale,
  onDeleteSale,
}: {
  showToast: (message: string) => void;
  saleList: ExtendedSale[];
  productList: (ProductProps & { formattedPrice?: string })[];
  onAddSale: (sale: {
    productId: string;
    quantity: number;
    unitPrice: number;
    paymentMethod: PaymentMethod;
  }) => Promise<void>;
  onUpdateSale: (id: string, sale: {
    quantity?: number;
    unitPrice?: number;
    paymentMethod?: PaymentMethod;
  }, password: string) => Promise<void>;
  onDeleteSale: (id: string, password: string) => Promise<void>;
}) {
  const searchParams = useSearchParams();
  const [modal, setModal] = useState(searchParams.get("novo") === "1");
  const [editModal, setEditModal] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  return {
    modal,
    setModal,
    editModal,
    setEditModal,
    deleteModal,
    setDeleteModal,
  };
}
