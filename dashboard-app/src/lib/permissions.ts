type UserWithPermissions = {
  role?: "Dono" | "Administrador" | "Gestor" | "Funcionario";
  permissionLevel?: 0 | 1 | 2 | 3;
  permissions?: Array<{ name: string; enabled?: boolean; viewReports?: boolean }>;
};

export function isEmployee(user?: UserWithPermissions | null): boolean {
  return user?.permissionLevel === 3 || user?.role === "Funcionario";
}

/** Clientes e produtos não fazem parte do escopo do perfil Funcionário. */
export function canAccessOperationalCatalog(user?: UserWithPermissions | null): boolean {
  return Boolean(user) && !isEmployee(user);
}

/** Funcionários acessam a dashboard, mas não as métricas e cards de resumo. */
export function canViewDashboardMetrics(user?: UserWithPermissions | null): boolean {
  return Boolean(user) && !isEmployee(user);
}

export function canAccessReports(user?: UserWithPermissions | null): boolean {
  if (!user || isEmployee(user)) return false;
  if (user.role === "Administrador") return true;
  return user.role === "Gestor" && user.permissions?.some(
    (permission) => permission.name === "Gestor" && permission.enabled === true && permission.viewReports === true,
  ) === true;
}

export function canAccessUsers(user?: UserWithPermissions | null): boolean {
  if (!user) return false;
  if (user.permissionLevel === 0 || user.permissionLevel === 1 || user.permissionLevel === 2 || user.role === "Dono" || user.role === "Gestor") return true;
  return false;
}

export function canApprovePortalAccess(user: UserWithPermissions): boolean {
  return user.role === "Gestor" || user.role === "Administrador";
}

export function canManageSales(user?: (UserWithPermissions & { impersonating?: boolean }) | null): boolean {
  return user?.role === "Administrador" && !user.impersonating;
}

export function canManageServices(user?: UserWithPermissions | null): boolean {
  return user?.role === "Administrador" || user?.role === "Gestor";
}
