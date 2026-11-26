import { cache } from "react";
import type { Client } from "@core/domain/auth/entities/client.entity";
import { PrismaClientRepository } from "@core/domain/auth/infrastructure/persistence/prisma/login/prisma-client.repository";

const base = new PrismaClientRepository();

/**
 * Memoiza a busca dentro de UMA renderização (React `cache`), não entre
 * requisições.
 *
 * `/cliente/painel` monta o estado do cadastro e o status da conta na mesma
 * renderização, e as duas buscavam o mesmo cliente: eram duas idas ao Neon
 * (~150 ms cada) para a mesma linha. Como o escopo é a requisição, um cliente
 * nunca enxerga o dado de outro e uma escrita na mesma requisição não é
 * mascarada por leitura antiga de outra.
 */
const findByIdOnce = cache((id: string) => base.findById(id));

export class PortalClientRepository extends PrismaClientRepository {
  override findById(id: string): Promise<Client | null> {
    return findByIdOnce(id);
  }
}

export const portalClientRepository = new PortalClientRepository();
