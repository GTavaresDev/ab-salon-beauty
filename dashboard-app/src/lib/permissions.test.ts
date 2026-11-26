import { describe, expect, it } from "vitest";
import {
  canAccessOperationalCatalog,
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
