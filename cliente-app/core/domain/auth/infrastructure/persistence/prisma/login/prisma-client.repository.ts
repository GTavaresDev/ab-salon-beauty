import { prisma } from "@core/infrastructure/shared/client";
import { Client } from "@core/domain/auth/entities/client.entity";
import { ClientRepository } from "@core/domain/auth/repositories/client.repository";
import { ClientMapper } from "./client.mapper";
import { CacheKeys, CacheTTL, getCached, invalidate } from "@core/infrastructure/cache/index";

export class PrismaClientRepository implements ClientRepository {
  async save(client: Client): Promise<void> {
    const raw = ClientMapper.toPersistence(client);
    await prisma.client.create({
      data: raw,
    });
    await invalidate(CacheKeys.clients);
  }

  async findById(id: string): Promise<Client | null> {
    try {
      const raw = await prisma.client.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          password: true,
          birthDate: true,
          status: true,
          initials: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return raw ? ClientMapper.toDomain(raw) : null;
    } catch (error) {
      console.error("[PrismaClientRepository.findById] Database query failed:", error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<Client | null> {
    try {
      const raw = await prisma.client.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          password: true,
          birthDate: true,
          status: true,
          initials: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return raw ? ClientMapper.toDomain(raw) : null;
    } catch (error) {
      console.error("[PrismaClientRepository.findByEmail] Database query failed:", error);
      throw error;
    }
  }

  async findAll(): Promise<Client[]> {
    try {
      const list = await getCached(CacheKeys.clients, CacheTTL.clients, () =>
        prisma.client.findMany({
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            password: true,
            birthDate: true,
            status: true,
            initials: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
      );
      return list.map(ClientMapper.toDomain);
    } catch (error) {
      console.error("[PrismaClientRepository.findAll] Database query failed:", error);
      throw error;
    }
  }

  async update(client: Client): Promise<void> {
    const raw = ClientMapper.toPersistence(client);
    await prisma.client.update({
      where: { id: client.id },
      data: {
        name: raw.name,
        email: raw.email,
        phone: raw.phone,
        password: raw.password,
        birthDate: raw.birthDate,
        status: raw.status,
        initials: raw.initials,
        updatedAt: raw.updatedAt,
      },
    });
    await invalidate(CacheKeys.clients);
  }

  async delete(id: string): Promise<void> {
    await prisma.client.delete({
      where: { id },
    });
    await invalidate(CacheKeys.clients);
  }
}
