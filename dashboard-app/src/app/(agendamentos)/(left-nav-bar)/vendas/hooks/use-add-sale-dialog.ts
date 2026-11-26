"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { ProductProps } from "@core/application/query/interface/product.entity";
import { type PaymentMethod } from "../_components/sales.component";

export function useAddSaleDialog({
  open,
  onClose,
  productList,
  showToast,
  onAddSale,
}: {
  open: boolean;
  onClose: () => void;
  productList: (ProductProps & { formattedPrice?: string })[];
  showToast: (message: string) => void;
  onAddSale: (sale: {
    productId: string;
    quantity: number;
    unitPrice: number;
    paymentMethod: PaymentMethod;
  }) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [formQuantity, setFormQuantity] = useState("");
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useScrollLock(open);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowProductSearch(false);
      }
    }

    if (showProductSearch) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProductSearch]);

  const filteredProducts = useMemo(() => {
    if (!productSearchTerm) return productList.filter((p) => p.status === "Ativo");
    const term = productSearchTerm.toLowerCase();
    return productList.filter(
      (p) => p.status === "Ativo" && (p.name.toLowerCase().includes(term) || p.id.toLowerCase().includes(term))
    );
  }, [productSearchTerm, productList]);

  const selectedProduct = useMemo(
    () => productList.find((p) => p.id === selectedProductId),
    [selectedProductId, productList]
  );

  const totalSale = useMemo(() => {
    if (!selectedProduct || !formQuantity) return 0;
    const quantity = Number(formQuantity);
    return selectedProduct.price * quantity;
  }, [selectedProduct, formQuantity]);

  function handleClose() {
    onClose();
  }

  async function addSale(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const quantity = Number(form.get("quantity"));
    const paymentMethod = String(form.get("paymentMethod")) as PaymentMethod;

    try {
      if (!selectedProductId) {
        throw new Error("Selecione um produto.");
      }
      if (!selectedProduct) {
        throw new Error("Produto não encontrado.");
      }
      if (quantity <= 0 || quantity > selectedProduct.quantity) {
        throw new Error(`Quantidade inválida. Disponível: ${selectedProduct.quantity}`);
      }

      await onAddSale({
        productId: selectedProductId,
        quantity,
        unitPrice: selectedProduct.price,
        paymentMethod,
      });

      // Reset form before closing modal to avoid null reference
      if (event.currentTarget) {
        event.currentTarget.reset();
      }

      onClose();
      setSelectedProductId("");
      setProductSearchTerm("");
      setShowProductSearch(false);
      setFormQuantity("");
      showToast("Venda registrada com sucesso.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao registrar venda.";
      showToast(message);
    } finally {
      setLoading(false);
    }
  }
  return {
    loading,
    setSelectedProductId,
    showProductSearch,
    setShowProductSearch,
    productSearchTerm,
    setProductSearchTerm,
    formQuantity,
    setFormQuantity,
    filteredProducts,
    selectedProduct,
    totalSale,
    handleClose,
    addSale,
    searchContainerRef,
  };
}
