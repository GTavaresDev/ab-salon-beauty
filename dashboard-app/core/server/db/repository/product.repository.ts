import { Product } from "@core/application/query/interface/product.entity";

export interface ProductRepository {
  findNamesByIds(ids: string[]): Promise<{ id: string; name: string }[]>;
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  save(product: Product): Promise<Product>;
  update(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}
