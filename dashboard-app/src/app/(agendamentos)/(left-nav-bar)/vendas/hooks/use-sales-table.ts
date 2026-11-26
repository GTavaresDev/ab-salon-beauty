"use client";

import { useMemo, useState } from "react";
import { paginateItems } from "@/lib/pagination";
import { type ExtendedSale } from "../_components/sales.component";

export function useSalesTable({
  saleList,
  onOpenAddModal,
  onEditSale,
  onDeleteSale,
}: {
  saleList: ExtendedSale[];
  onOpenAddModal: () => void;
  onEditSale: (id: string) => void;
  onDeleteSale: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("Todos");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return saleList.filter((sale) => {
      const pName = sale.productName || "";
      const sId = sale.id || "";
      const matchSearch =
        pName.toLowerCase().includes(search.toLowerCase()) ||
        sId.toLowerCase().includes(search.toLowerCase());
      const matchPayment =
        paymentFilter === "Todos" || sale.paymentMethod === paymentFilter;
      return matchSearch && matchPayment;
    });
  }, [saleList, search, paymentFilter]);

  const totalSales = useMemo(() => {
    return filtered.reduce((acc, sale) => acc + (sale.totalPrice || 0), 0);
  }, [filtered]);

  const avgTicket = filtered.length ? totalSales / filtered.length : 0;
  const topMethod = useMemo(() => {
    if (!filtered.length) return "—";
    const counts = new Map<string, number>();
    filtered.forEach((s) => {
      const m = s.paymentMethod || "Outro";
      counts.set(m, (counts.get(m) || 0) + 1);
    });
    let best = "—";
    let max = 0;
    counts.forEach((count, method) => {
      if (count > max) {
        max = count;
        best = method;
      }
    });
    return best;
  }, [filtered]);

  const pagedSales = useMemo(
    () => paginateItems(filtered, page),
    [filtered, page],
  );
  return {
    search,
    setSearch,
    paymentFilter,
    setPaymentFilter,
    page,
    setPage,
    openMenuId,
    setOpenMenuId,
    filtered,
    totalSales,
    avgTicket,
    topMethod,
    pagedSales,
  };
}
