import { Client } from "@core/domain/auth/entities/client.entity";

type PrismaClientRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string | null;
  birthDate: string | null;
  status: string;
  initials: string;
  createdAt: Date;
  updatedAt: Date;
};

export class ClientMapper {
  static toDomain(raw: PrismaClientRecord): Client {
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
