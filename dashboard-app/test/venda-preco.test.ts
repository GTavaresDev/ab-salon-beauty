import { describe, expect, it } from "vitest";
import { CreateSale } from "@core/server/use-case/sales/create-sale.use-case";
import { mockSaleRepository } from "@core/server/use-case/sales/test-helpers";
import { buildProduct, mockProductRepository } from "@core/server/use-case/products/test-helpers";
import venda from "./mocks/venda.json";

describe("Preço de catálogo na criação da venda", () => {
  it.each([0, 1, 1000, undefined])("usa o catálogo com preço recebido %s", async (unitPrice) => {
    const products = mockProductRepository();
    products.findById.mockResolvedValue(buildProduct({ price: venda.catalogPrice }));
    const sales = mockSaleRepository();
    sales.saveWithInventoryUpdate.mockImplementation(async (sale) => sale);

    await new CreateSale(sales, products).execute({ productId: venda.productId, quantity: venda.quantity, paymentMethod: venda.paymentMethod, unitPrice });

    expect(sales.saveWithInventoryUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ unitPrice: venda.catalogPrice, totalPrice: venda.totalPrice }), -venda.quantity,
    );
  });
});
