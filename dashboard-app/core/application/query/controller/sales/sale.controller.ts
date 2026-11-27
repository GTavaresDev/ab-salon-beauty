"use server";

import { createSaleGateway } from "@core/server/gateway/sale.gateway";
import type { ActionResult } from "@core/application/query/interface/action.interface";
import { SaleProps } from "@core/application/query/interface/sale.entity";
import { requireSessionAction } from "@core/application/query/controller/users/auth.controller";
import { PrismaUserRepository } from "@core/server/db/repository/users/prisma-user.repository";
import { verifyPassword } from "@core/server/auth/password";
import { canManageSales } from "@/lib/permissions";
import { formatActionError } from "@/lib/action-error-handler";

const saleFactory = createSaleGateway();
const { products: productRepository, create: createSale, list: listSales, update: updateSale, delete: deleteSale } = saleFactory;

export async function fetchSalesAction(filter?: {
  search?: string;
  paymentMethod?: string;
}): Promise<(SaleProps & { formattedTotal: string; formattedUnitPrice: string; productName?: string })[]> {
  await requireSessionAction();
  const useCase = listSales;
  const sales = await useCase.execute(filter);

  // Uma consulta para todos os produtos citados, não uma por venda.
  const products = await productRepository.findNamesByIds([...new Set(sales.map((sale) => sale.productId))]);
  const nameByProductId = new Map(products.map((p) => [p.id, p.name]));

  return sales.map((sale) => ({
    ...sale.toJSON(),
    productName: nameByProductId.get(sale.productId),
  }));
}

export async function createSaleAction(input: {
  productId: string;
  quantity: number;
  unitPrice?: number;
  paymentMethod: "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência";
}): Promise<ActionResult<SaleProps & { formattedTotal: string; formattedUnitPrice: string }>> {
  try {
    const session = await requireSessionAction();
    const useCase = createSale;
    const created = await useCase.execute({
      productId: input.productId,
      quantity: input.quantity,
      paymentMethod: input.paymentMethod,
      createdById: session?.id,
    });
    return { success: true, data: created.toJSON() };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao registrar venda.") };
  }
}

const staffUsers = new PrismaUserRepository();

async function confirmSaleManagement(password: string): Promise<void> {
  const session = await requireSessionAction();
  if (!canManageSales(session)) throw new Error("Sem permissão para alterar vendas.");

  const user = await staffUsers.findById(session.id);
  if (user?.status !== "Ativo" || user.role !== "Administrador" || !user.password ||
    typeof password !== "string" || !await verifyPassword(password, user.password)) {
    throw new Error("Senha da sua conta incorreta.");
  }
}

export async function updateSaleAction(input: {
  id: string;
  quantity?: number;
  unitPrice?: number;
  paymentMethod?: "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência";
  password: string;
}): Promise<ActionResult<SaleProps & { formattedTotal: string; formattedUnitPrice: string }>> {
  try {
    await confirmSaleManagement(input.password);

    const useCase = updateSale;
    const updated = await useCase.execute({
      id: input.id,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      paymentMethod: input.paymentMethod,
    });
    return { success: true, data: updated.toJSON() };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao atualizar venda.") };
  }
}

export async function deleteSaleAction(input: {
  id: string;
  password: string;
}): Promise<ActionResult<void>> {
  try {
    await confirmSaleManagement(input.password);

    const useCase = deleteSale;
    await useCase.execute(input.id);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao excluir venda.") };
  }
}
