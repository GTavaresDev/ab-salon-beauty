"use server";

import { createProductGateway } from "@core/server/gateway/product.gateway";
import type { ActionResult } from "@core/application/query/interface/action.interface";
import { ProductProps } from "@core/application/query/interface/product.entity";
import { requireSessionAction } from "@core/application/query/controller/users/auth.controller";
import { formatActionError } from "@/lib/action-error-handler";
import { canAccessOperationalCatalog } from "@/lib/permissions";

const { create: createProduct, list: listProducts, update: updateProduct, delete: deleteProduct } = createProductGateway();

export async function fetchProductsAction(filter?: {
  search?: string;
  category?: string;
  status?: string;
}): Promise<(ProductProps & { formattedPrice: string })[]> {
  requireProductAccess(await requireSessionAction());
  const useCase = listProducts;
  const products = await useCase.execute(filter);
  return products.map((p) => p.toJSON());
}

/**
 * Funcionários não podem acessar o catálogo de produtos, mas precisam consultar
 * os itens disponíveis para registrar uma venda.
 */
export async function fetchProductsForSalesAction(): Promise<
  (ProductProps & { formattedPrice: string })[]
> {
  await requireSessionAction();
  const products = await listProducts.execute({ status: "Ativo" });
  return products.map((product) => product.toJSON());
}

export async function createProductAction(input: {
  name: string;
  category: string;
  price: number;
  quantity: number;
  status?: "Ativo" | "Inativo" | "Baixo estoque";
}): Promise<ActionResult<ProductProps & { formattedPrice: string }>> {
  try {
    requireProductAccess(await requireSessionAction());
    const useCase = createProduct;
    const created = await useCase.execute(input);
    return { success: true, data: created.toJSON() };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao criar produto.") };
  }
}

export async function updateProductAction(input: {
  id: string;
  name?: string;
  category?: string;
  price?: number;
  quantity?: number;
  status?: "Ativo" | "Inativo" | "Baixo estoque";
}): Promise<ActionResult<ProductProps & { formattedPrice: string }>> {
  try {
    requireProductAccess(await requireSessionAction());
    const useCase = updateProduct;
    const updated = await useCase.execute(input);
    return { success: true, data: updated.toJSON() };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao atualizar produto.") };
  }
}

export async function deleteProductAction(
  id: string,
): Promise<ActionResult<void>> {
  try {
    requireProductAccess(await requireSessionAction());
    const useCase = deleteProduct;
    await useCase.execute(id);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao excluir produto.") };
  }
}

function requireProductAccess(session: Awaited<ReturnType<typeof requireSessionAction>>): void {
  if (!canAccessOperationalCatalog(session)) {
    throw new Error("Você não tem permissão para acessar produtos.");
  }
}
