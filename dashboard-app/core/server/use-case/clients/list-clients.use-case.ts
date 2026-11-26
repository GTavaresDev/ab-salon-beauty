import { Client } from "@core/application/query/interface/client.entity";
import { ClientRepository } from "@core/server/db/repository/client.repository";

export class ListClients {
  constructor(private clientRepository: ClientRepository) {}

  async execute(): Promise<Client[]> {
    return this.clientRepository.findAll();
  }
}
