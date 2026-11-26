import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";

describe("PrismaSaleRepository with PostgreSQL", () => {
  let prisma: typeof import("@core/server/db/prisma").prisma;
  let PrismaSaleRepository: typeof import("./prisma-sale.repository").PrismaSaleRepository;
  let Sale: typeof import("@core/application/query/interface/sale.entity").Sale;
  let productIds: string[] = [];
  let saleIds: string[] = [];

  beforeAll(async () => {
    loadEnvConfig(process.cwd());
    if (!process.env.TEST_DATABASE_URL) {
      throw new Error("TEST_DATABASE_URL deve apontar para uma cópia local descartável do banco.");
    }
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    ({ prisma } = await import("@core/server/db/prisma"));
    ({ PrismaSaleRepository } = await import("./prisma-sale.repository"));
    ({ Sale } = await import("@core/application/query/interface/sale.entity"));
  });

  beforeEach(async () => {
    await prisma.sale.deleteMany({ where: { id: { in: saleIds } } });
    await prisma.product.deleteMany({ where: { id: { in: productIds } } });
    saleIds = [];
    productIds = [];
  });

  afterAll(async () => {
    await prisma.sale.deleteMany({ where: { id: { in: saleIds } } });
    await prisma.product.deleteMany({ where: { id: { in: productIds } } });
    await prisma.$disconnect();
  });

  it("persists the sale and decrements inventory in one transaction", async () => {
    const productId = randomUUID();
    const product = await prisma.product.create({
      data: { id: productId, name: "Produto teste", category: "Teste", price: 25, quantity: 8 },
    });
    productIds.push(product.id);
    const saleId = randomUUID();
    saleIds.push(saleId);
    const repository = new PrismaSaleRepository();
    const sale = new Sale({
      id: saleId,
      productId: product.id,
      quantity: 3,
      unitPrice: 25,
      totalPrice: 75,
      paymentMethod: "Pix",
    });

    await repository.saveWithInventoryUpdate(sale, -3);

    await expect(prisma.product.findUniqueOrThrow({ where: { id: product.id } })).resolves.toMatchObject({
      quantity: 5,
    });
    await expect(prisma.sale.findUnique({ where: { id: sale.id } })).resolves.toMatchObject({
      quantity: 3,
      totalPrice: 75,
    });
  });

  it("rolls back the sale when inventory would become negative", async () => {
    const productId = randomUUID();
    const product = await prisma.product.create({
      data: { id: productId, name: "Estoque baixo", category: "Teste", price: 25, quantity: 2 },
    });
    productIds.push(product.id);
    const saleId = randomUUID();
    saleIds.push(saleId);
    const repository = new PrismaSaleRepository();
    const sale = new Sale({
      id: saleId,
      productId: product.id,
      quantity: 3,
      unitPrice: 25,
      totalPrice: 75,
      paymentMethod: "Pix",
    });

    await expect(repository.saveWithInventoryUpdate(sale, -3)).rejects.toThrow(
      "Quantidade insuficiente em estoque.",
    );
    await expect(prisma.product.findUniqueOrThrow({ where: { id: product.id } })).resolves.toMatchObject({
      quantity: 2,
    });
    await expect(prisma.sale.count()).resolves.toBe(0);
  });
});
