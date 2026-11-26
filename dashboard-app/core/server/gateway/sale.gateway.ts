import { PrismaSaleRepository } from "@core/server/db/repository/sales/prisma-sale.repository";
import { PrismaProductRepository } from "@core/server/db/repository/products/prisma-product.repository";
import { CreateSale } from "@core/server/use-case/sales/create-sale.use-case";
import { ListSales } from "@core/server/use-case/sales/list-sales.use-case";
import { UpdateSale } from "@core/server/use-case/sales/update-sale.use-case";
import { DeleteSale } from "@core/server/use-case/sales/delete-sale.use-case";

export function createSaleGateway() {
  const sales = new PrismaSaleRepository();
  const products = new PrismaProductRepository();
  return {
    sales,
    products,
    create: new CreateSale(sales, products),
    list: new ListSales(sales),
    update: new UpdateSale(sales, products),
    delete: new DeleteSale(sales),
  };
}
