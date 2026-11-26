import { afterAll, describe, expect, it, vi } from "vitest";
import { createSaleGateway } from "@core/server/gateway/sale.gateway";
import { prisma } from "./postgres-local";

vi.mock("@core/server/db/prisma", () => import("./postgres-local"));
vi.mock("@core/server/cache/redis", () => ({ redis: null, isCacheEnabled: false }));

const sale = createSaleGateway().create;
const sell = (productId: string) => sale.execute({ productId, quantity: 2, unitPrice: 1, paymentMethod: "Pix" });
const productIds: string[] = [];
async function product(quantity: number) {
  const row = await prisma.product.create({ data: { name: "Produto fictício", category: "Teste", price: 25, quantity } });
  productIds.push(row.id);
  return row.id;
}

afterAll(async () => {
  try {
    await prisma.sale.deleteMany({ where: { productId: { in: productIds } } });
    await prisma.product.deleteMany({ where: { id: { in: productIds } } });
  } finally {
    await prisma.$disconnect();
  }
});

describe("Venda em PostgreSQL", () => {
  it("grava o preço do catálogo e baixa a quantidade vendida", async () => {
    const id = await product(5);
    await sell(id);
    expect(await prisma.sale.findMany({ where: { productId: id } })).toMatchObject([
      { unitPrice: 25, quantity: 2, totalPrice: 50 },
    ]);
    expect(await prisma.product.findUniqueOrThrow({ where: { id } })).toMatchObject({ quantity: 3 });
  });

  it("recusa produto com estoque zero sem gerar venda", async () => {
    const id = await product(0);
    await expect(sell(id)).rejects.toThrow(/estoque/i);
    expect(await prisma.sale.count({ where: { productId: id } })).toBe(0);
    expect(await prisma.product.findUniqueOrThrow({ where: { id } })).toMatchObject({ quantity: 0 });
  });

  it.each([
    { campo: "preço", change: { price: 32 }, expected: { price: 32, quantity: 5 } },
    { campo: "estoque", change: { quantity: 4 }, expected: { price: 25, quantity: 4 } },
  ])("reverte a venda se o $campo mudar entre a leitura e a baixa", async ({ change, expected }) => {
    const id = await product(5);
    let result: Promise<unknown> | undefined;
    try {
      await prisma.$transaction(async (editor) => {
        await editor.product.update({ where: { id }, data: change });
        const [owner] = await editor.$queryRaw<{ pid: number }[]>`SELECT pg_backend_pid() AS pid`;
        result = sell(id).catch((error: unknown) => error);
        // A edição só faz commit quando a outra conexão já tentou a baixa.
        await vi.waitFor(async () => {
          const [lock] = await prisma.$queryRaw<{ waiting: boolean }[]>
            `SELECT EXISTS (SELECT 1 FROM pg_stat_activity
             WHERE ${owner.pid}::integer = ANY(pg_blocking_pids(pid))) AS waiting`;
          expect(lock.waiting).toBe(true);
        }, { timeout: 3000, interval: 20 });
      });
      expect(await result).toMatchObject({ code: "P2025" });
      expect(await prisma.sale.count({ where: { productId: id } })).toBe(0);
      expect(await prisma.product.findUniqueOrThrow({ where: { id } })).toMatchObject(expected);
    } finally {
      await result;
    }
  });
});
