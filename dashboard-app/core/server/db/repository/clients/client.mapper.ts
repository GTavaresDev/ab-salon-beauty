import { Client as PrismaClientModel } from "@prisma/client";
import { Client } from "@core/application/query/interface/client.entity";

export class ClientMapper {
  static toDomain(raw: Omit<PrismaClientModel, "portalAccess" | "portalApprovedAt" | "portalApprovedById" | "credentialVersion">): Client {
    return new Client({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      phone: raw.phone,
      password: raw.password,
      birthDate: raw.birthDate || "",
      status: (raw.status as "Ativo" | "Inativo") || "Ativo",
      initials: raw.initials,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(client: Client) {
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      password: client.password,
      birthDate: client.birthDate || null,
      status: client.status,
      initials: client.initials,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }
}
