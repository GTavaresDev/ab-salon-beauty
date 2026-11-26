"use client";

import { useAddSaleDialog } from "../hooks/use-add-sale-dialog";
import { Search, X } from "lucide-react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card.component";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input.component";
import { ProductProps } from "@core/application/query/interface/product.entity";
import { FieldLabel, PAYMENT_METHODS, type PaymentMethod } from "./sales.component";

export function AddSaleDialog({
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
  const {
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
  } = useAddSaleDialog({ open, onClose, productList, showToast, onAddSale });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 lg:left-64 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && handleClose()}
    >
      <Card className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden shadow-2xl">
        <CardHeader className="flex-row shrink-0 items-start justify-between">
          <div>
            <CardTitle>Registrar Venda</CardTitle>
            <CardDescription>
              Venda de produto com atualização automática de estoque.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 -mt-2"
            onClick={handleClose}
          >
            <X />
          </Button>
        </CardHeader>
        <form onSubmit={addSale} className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
          <CardContent className="space-y-4">
            <div>
              <FieldLabel>Produto</FieldLabel>
              <div ref={searchContainerRef} className="relative">
                <Input
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  onFocus={() => setShowProductSearch(true)}
                  placeholder="Buscar por nome ou código..."
                  className="pr-9"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                {showProductSearch && filteredProducts.length > 0 && (
                  <div className="absolute top-11 left-0 right-0 z-50 rounded-lg border border-zinc-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setSelectedProductId(product.id);
                          setProductSearchTerm("");
                          setShowProductSearch(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-zinc-50 border-b last:border-b-0 text-sm"
                      >
                        <div className="font-medium text-zinc-900">{product.name}</div>
                        <div className="text-xs text-zinc-500">
                          {product.quantity} em estoque • {product.category}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedProduct && (
              <Card className="bg-blue-50 border-blue-200 p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-zinc-600 text-xs">Produto</span>
                    <p className="font-semibold text-zinc-900">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <span className="text-zinc-600 text-xs">Categoria</span>
                    <p className="font-semibold text-zinc-900">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <span className="text-zinc-600 text-xs">Preço</span>
                    <p className="font-semibold text-green-600">
                      {typeof selectedProduct.price === "number"
                        ? selectedProduct.price.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                        : selectedProduct.price}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-600 text-xs">Em estoque</span>
                    <p className="font-semibold text-zinc-900">{selectedProduct.quantity}</p>
                  </div>
                </div>
              </Card>
            )}

            <div>
              <FieldLabel>Quantidade</FieldLabel>
              <Input
                required
                type="number"
                name="quantity"
                min="1"
                max={selectedProduct?.quantity || 0}
                placeholder="1"
                value={formQuantity}
                onChange={(e) => setFormQuantity(e.target.value)}
              />
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-2">Total da Venda</div>
              <div className="text-3xl font-bold text-green-600">
                {totalSale.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
            </div>

            <div>
              <FieldLabel>Método de Pagamento</FieldLabel>
              <select
                name="paymentMethod"
                defaultValue="Dinheiro"
                className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !selectedProduct}>
                {loading ? "Registrando..." : "Registrar Venda"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
