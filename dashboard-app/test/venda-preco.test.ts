import { describe, expect, it } from "vitest";
import { CreateSale } from "@core/server/use-case/sales/create-sale.use-case";
import { mockSaleRepository } from "@core/server/use-case/sales/test-helpers";
import { buildProduct, mockProductRepository } from "@core/server/use-case/products/test-helpers";

describe("Preço de catálogo na criação da venda", () => {
  it.each([0, 1, 1000, undefined])("usa o catálogo com preço recebido %s", async (unitPrice) => {
    const products = mockProductRepository();
    products.findById.mockResolvedValue(buildProduct({ price: 19.5 }));
    const sales = mockSaleRepository();
    sales.saveWithInventoryUpdate.mockImplementation(async (sale) => sale);

    await new CreateSale(sales, products).execute({ productId: "p1", quantity: 2, paymentMethod: "Pix", unitPrice });

    expect(sales.saveWithInventoryUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ unitPrice: 19.5, totalPrice: 39 }), -2,
    );
  });
});
