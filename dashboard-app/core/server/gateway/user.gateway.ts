import { PrismaUserRepository } from "@core/server/db/repository/users/prisma-user.repository";
import { PrismaPermissionRepository } from "@core/server/db/repository/users/prisma-permission.repository";
import { CreateUser } from "@core/server/use-case/users/create-user.use-case";
import { ListUsers } from "@core/server/use-case/users/list-users.use-case";
import { UpdateUser } from "@core/server/use-case/users/update-user.use-case";
import { DeleteUser } from "@core/server/use-case/users/delete-user.use-case";
import { AuthenticateUser } from "@core/server/use-case/users/authenticate-user.use-case";
import { GrantPermission } from "@core/server/use-case/users/grant-permission.use-case";
import { RevokePermission } from "@core/server/use-case/users/revoke-permission.use-case";

export function createUserGateway() {
  const users = new PrismaUserRepository();
  const permissions = new PrismaPermissionRepository();
  return {
    users,
    permissions,
    create: new CreateUser(users),
    list: new ListUsers(users),
    update: new UpdateUser(users),
    delete: new DeleteUser(users),
    authenticate: (repository = users) => new AuthenticateUser(repository),
    grantPermission: new GrantPermission(permissions, users),
    revokePermission: new RevokePermission(permissions, users),
  };
}
