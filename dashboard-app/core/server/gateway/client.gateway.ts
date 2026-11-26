import { PrismaClientRepository } from "@core/server/db/repository/clients/prisma-client.repository";
import { CreateClient } from "@core/server/use-case/clients/create-client.use-case";
import { ListClients } from "@core/server/use-case/clients/list-clients.use-case";
import { UpdateClient } from "@core/server/use-case/clients/update-client.use-case";
import { DeleteClient } from "@core/server/use-case/clients/delete-client.use-case";

export function createClientGateway() {
  const clients = new PrismaClientRepository();
  return {
    clients,
    create: new CreateClient(clients),
    list: new ListClients(clients),
    update: new UpdateClient(clients),
    delete: new DeleteClient(clients),
  };
}
