import { Service } from "@core/application/query/interface/service.entity";
import { ServiceRepository } from "@core/server/db/repository/service.repository";

export class ListServices {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute(): Promise<Service[]> {
    return await this.serviceRepository.findAll();
  }
}
