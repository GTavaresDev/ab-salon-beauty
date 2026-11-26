import { SaleRepository } from "@core/server/db/repository/sale.repository";

export class DeleteSale {
  constructor(private saleRepository: SaleRepository) {}

  async execute(id: string): Promise<void> {
    const sale = await this.saleRepository.findById(id);

    if (!sale) {
      throw new Error("Venda não encontrada.");
    }

    await this.saleRepository.deleteWithInventoryRestore(id);
  }
}
