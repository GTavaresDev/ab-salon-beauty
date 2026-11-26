import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SalesView } from "./_components/sales-view.component";
import { ProductsProvider } from "../produtos/hooks/use-products";
import { SalesProvider } from "./hooks/use-sales";

export const metadata: Metadata = {
  title: "Vendas — Agendamentos",
  description: "Registre vendas e gerencie o caixa do seu negócio.",
};

export default async function SalesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <ProductsProvider forSales>
      <SalesProvider>
        <SalesView />
      </SalesProvider>
    </ProductsProvider>
  );
}
