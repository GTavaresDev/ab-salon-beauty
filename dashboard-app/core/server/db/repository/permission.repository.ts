import { UserPermission } from '@core/application/query/interface/user-permission.entity';

export interface IPermissionRepository {
  // User Permissions
  findUserPermissions(userId: string): Promise<UserPermission[]>;
  findUserPermission(userId: string, permissionName: string): Promise<UserPermission | null>;
  grantPermission(userId: string, permissionName: string): Promise<UserPermission>;
  revokePermission(userId: string, permissionName: string): Promise<void>;
  hasPermission(userId: string, permissionName: string): Promise<boolean>;
}
