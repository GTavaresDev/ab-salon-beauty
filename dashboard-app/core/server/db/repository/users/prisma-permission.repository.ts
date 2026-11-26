import { prisma } from '@core/server/db/prisma';
import { IPermissionRepository } from '@core/server/db/repository/permission.repository';
import { UserPermission, UserPermissionProps } from '@core/application/query/interface/user-permission.entity';
import { CacheKeys, invalidate } from '@core/server/cache/index';

export class PrismaPermissionRepository implements IPermissionRepository {
  async findUserPermissions(userId: string): Promise<UserPermission[]> {
    const perms = await prisma.userPermission.findMany({
      where: { userId, enabled: true },
    });
    return perms.map(p => new UserPermission(p as UserPermissionProps));
  }

  async findUserPermission(userId: string, permissionName: string): Promise<UserPermission | null> {
    const perm = await prisma.userPermission.findUnique({
      where: { userId_name: { userId, name: permissionName } },
    });
    return perm ? new UserPermission(perm as UserPermissionProps) : null;
  }

  async grantPermission(userId: string, permissionName: string): Promise<UserPermission> {
    const perm = await prisma.userPermission.upsert({
      where: { userId_name: { userId, name: permissionName } },
      update: { enabled: true, updatedAt: new Date() },
      create: {
        userId,
        name: permissionName,
        enabled: true,
      },
    });
    // `users:all` carrega as permissões habilitadas de cada usuário.
    await invalidate(CacheKeys.users);
    return new UserPermission(perm as UserPermissionProps);
  }

  async revokePermission(userId: string, permissionName: string): Promise<void> {
    await prisma.userPermission.updateMany({
      where: { userId, name: permissionName },
      data: { enabled: false, updatedAt: new Date() },
    });
    await invalidate(CacheKeys.users);
  }

  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    const perm = await this.findUserPermission(userId, permissionName);
    return perm?.toJSON().enabled === true;
  }

}
