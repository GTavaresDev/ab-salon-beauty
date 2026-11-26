import { PrismaProductRepository } from "@core/server/db/repository/products/prisma-product.repository";
import { CreateProduct } from "@core/server/use-case/products/create-product.use-case";
import { ListProducts } from "@core/server/use-case/products/list-products.use-case";
import { UpdateProduct } from "@core/server/use-case/products/update-product.use-case";
import { DeleteProduct } from "@core/server/use-case/products/delete-product.use-case";

export function createProductGateway() {
  const products = new PrismaProductRepository();
  return {
    products,
    create: new CreateProduct(products),
    list: new ListProducts(products),
    update: new UpdateProduct(products),
    delete: new DeleteProduct(products),
  };
}
