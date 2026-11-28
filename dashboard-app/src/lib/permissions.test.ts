import { describe, expect, it } from "vitest";
import {
  canAccessOperationalCatalog,
  canApprovePortalAccess,
  canAccessReports,
  canViewDashboardMetrics,
  isEmployee,
} from "./permissions";

describe("role permissions", () => {
  it("denies catalog and dashboard metrics to Funcionário", () => {
    const employee = { role: "Funcionario" as const, permissionLevel: 3 };

    expect(isEmployee(employee)).toBe(true);
    expect(canAccessOperationalCatalog(employee)).toBe(false);
    expect(canViewDashboardMetrics(employee)).toBe(false);
  });

  it.each(["Dono", "Administrador", "Gestor"] as const)(
    "allows %s to access the operational catalog and dashboard metrics",
    (role) => {
      const user = { role };

      expect(isEmployee(user)).toBe(false);
      expect(canAccessOperationalCatalog(user)).toBe(true);
      expect(canViewDashboardMetrics(user)).toBe(true);
    },
  );
});

describe("acesso a relatórios", () => {
  const reportPermission = { name: "Gestor", enabled: true, viewReports: true };

  it("libera Product Manegar e bloqueia Usuario mesmo com a coluna habilitada", () => {
    expect(canAccessReports({ role: "Administrador" })).toBe(true);
    expect(canAccessReports({ role: "Funcionario", permissions: [reportPermission] })).toBe(false);
    expect(canAccessReports({ role: "Dono", permissions: [reportPermission] })).toBe(false);
  });

  it("exige a coluna habilitada na permissão ativa do Gestor", () => {
    expect(canAccessReports({ role: "Gestor" })).toBe(false);
    expect(canAccessReports({ role: "Gestor", permissions: [reportPermission] })).toBe(true);
    expect(canAccessReports({ role: "Gestor", permissions: [{ ...reportPermission, enabled: false }] })).toBe(false);
    expect(canAccessReports({ role: "Gestor", permissions: [{ ...reportPermission, viewReports: false }] })).toBe(false);
    expect(canAccessReports({ role: "Gestor", permissions: [{ ...reportPermission, name: "Ver_Relatorios" }] })).toBe(false);
  });
});

describe("aprovação do portal", () => {
  it("permite somente Product Manegar", () => {
    expect(canApprovePortalAccess({ role: "Administrador", permissionLevel: 1 })).toBe(true);
    expect(canApprovePortalAccess({ role: "Gestor", permissionLevel: 2 })).toBe(false);
    expect(canApprovePortalAccess({ role: "Funcionario", permissionLevel: 3 })).toBe(false);
    expect(canApprovePortalAccess({ role: "Administrador", permissionLevel: 2 })).toBe(false);
  });
});
