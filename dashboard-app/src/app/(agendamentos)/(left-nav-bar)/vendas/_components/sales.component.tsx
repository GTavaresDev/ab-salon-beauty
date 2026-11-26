"use client";

import { useSales, type PaymentMethod, type ExtendedSale } from "../hooks/use-sales-panel";
import { ProductProps } from "@core/application/query/interface/product.entity";
import { SalesTable } from "./sales-table.component";
import { AddSaleDialog } from "./add-sale-dialog.component";
import { EditSaleDialog } from "./edit-sale-dialog.component";
import { DeleteSaleDialog } from "./delete-sale-dialog.component";

export function FieldLabel({ children }: { children: string }) {
  return <label className="block text-xs font-semibold text-zinc-700 mb-2">{children}</label>;
}

export function Sales({
  showToast,
  saleList,
  productList,
  onAddSale,
  onUpdateSale,
  onDeleteSale,
  canViewMetrics,
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
  canViewMetrics: boolean;
}) {
  const {
    modal,
    setModal,
    editModal,
    setEditModal,
    deleteModal,
    setDeleteModal,
  } = useSales({ showToast, saleList, productList, onAddSale, onUpdateSale, onDeleteSale });

  return (
    <div className="mx-auto max-w-375 p-3.5 sm:p-6 lg:p-8">
      <SalesTable
        saleList={saleList}
        onOpenAddModal={() => setModal(true)}
        onEditSale={setEditModal}
        onDeleteSale={setDeleteModal}
        canViewMetrics={canViewMetrics}
      />

      <AddSaleDialog
        open={modal}
        onClose={() => setModal(false)}
        productList={productList}
        showToast={showToast}
        onAddSale={onAddSale}
      />

      <EditSaleDialog
        saleId={editModal}
        onClose={() => setEditModal(null)}
        saleList={saleList}
        productList={productList}
        showToast={showToast}
        onUpdateSale={onUpdateSale}
      />

      <DeleteSaleDialog
        saleId={deleteModal}
        onClose={() => setDeleteModal(null)}
        showToast={showToast}
        onDeleteSale={onDeleteSale}
      />
    </div>
  );
}

export { PAYMENT_METHODS, type PaymentMethod, type ExtendedSale } from "../hooks/use-sales-panel";
