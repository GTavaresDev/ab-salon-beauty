import type { Prisma } from "@prisma/client";
import { prisma } from "@core/server/db/prisma";
import { User } from "@core/application/query/interface/user.entity";
import { UserRepository } from "@core/server/db/repository/user.repository";
import { rolePermissionNames } from "@core/server/rule/permission-validation.business-rule";
import { permissionNameFromRole, UserMapper } from "./user.mapper";
import { CacheKeys, CacheTTL, getCached, invalidate } from "@core/server/cache/index";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: Prisma.TransactionClient = prisma) {}

  async findAll(options?: { excludePrivileged?: boolean }): Promise<User[]> {
    try {
      if (options?.excludePrivileged) {
        const rows = await this.db.user.findMany({
          omit: { password: true },
          include: { permissions: { where: { enabled: true } } },
          orderBy: { createdAt: "desc" },
        });
        return rows
          .map((row) => UserMapper.toDomain({ ...row, password: null }))
          .filter((user) => user.role === "Gestor" || user.role === "Funcionario");
      }
      const records = await getCached(CacheKeys.users, CacheTTL.users, async () => {
        // O hash de senha nunca entra no Redis. Quem autentica é findByEmail,
        // que não passa por cache — findAll só alimenta listagens.
        const rows = await this.db.user.findMany({
          omit: { password: true },
          include: { permissions: { where: { enabled: true } } },
          orderBy: { createdAt: "desc" },
        });
        return rows.map((row) => ({ ...row, password: null }));
      });
      return records.map(UserMapper.toDomain);
    } catch (error) {
      console.error("[PrismaUserRepository.findAll] Database query failed:", error);
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const record = await this.db.user.findUnique({
        where: { id },
        include: { permissions: { where: { enabled: true } } },
      });
      return record ? UserMapper.toDomain(record) : null;
    } catch (error) {
      console.error("[PrismaUserRepository.findById] Database query failed:", error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const record = await this.db.user.findUnique({
        where: { email },
        include: { permissions: { where: { enabled: true } } },
      });
      return record ? UserMapper.toDomain(record) : null;
    } catch (error) {
      console.error("[PrismaUserRepository.findByEmail] Database query failed:", error);
      throw error;
    }
  }

  async save(user: User): Promise<User> {
    const raw = UserMapper.toPersistence(user);

    const created = await this.db.user.create({
      data: {
        id: raw.id,
        name: raw.name,
        email: raw.email,
        phone: raw.phone,
        ...(raw.password ? { password: raw.password } : {}),
        status: raw.status,
        last: raw.last,
        initials: raw.initials,
        failedLoginAttempts: raw.failedLoginAttempts,
        lockedUntil: raw.lockedUntil,
        commissionPercent: raw.commissionPercent,
        permissions: {
          create: [{ name: permissionNameFromRole(raw.role) }],
        },
      },
      include: { permissions: { where: { enabled: true } } },
    });
    await invalidate(CacheKeys.users);
    return UserMapper.toDomain(created);
  }

  async update(user: User): Promise<User> {
    const raw = UserMapper.toPersistence(user);
    const updated = await this.db.user.update({
      where: { id: raw.id },
      data: {
        name: raw.name,
        email: raw.email,
        phone: raw.phone,
        ...(raw.password ? { password: raw.password } : {}),
        status: raw.status,
        last: raw.last,
        initials: raw.initials,
        failedLoginAttempts: raw.failedLoginAttempts,
        lockedUntil: raw.lockedUntil,
        commissionPercent: raw.commissionPercent,
        permissions: {
          deleteMany: { name: { in: rolePermissionNames } },
          create: [{ name: permissionNameFromRole(raw.role) }],
        },
      },
      include: { permissions: { where: { enabled: true } } },
    });
    await invalidate(CacheKeys.users);
    return UserMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.db.user.delete({ where: { id } });
    await invalidate(CacheKeys.users);
  }
}
