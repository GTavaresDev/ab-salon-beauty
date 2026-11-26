import { describe, expect, it } from "vitest";
import { canCreateRole, parseCreatablePermissionLevel } from "./creatable-roles.business-rule";

describe("creatable roles", () => {
  it("allows Gestor to create only Usuario (Funcionario internally)", () => {
    expect(canCreateRole("Gestor", "Funcionario")).toBe(true);
    expect(canCreateRole("Gestor", "Gestor")).toBe(false);
    expect(canCreateRole("Gestor", "Dono")).toBe(false);
  });

  it("allows Product Manegar's internal role to create Gestor and Usuario", () => {
    expect(canCreateRole("Administrador", "Gestor")).toBe(true);
    expect(canCreateRole("Administrador", "Funcionario")).toBe(true);
    expect(canCreateRole("Administrador", "Dono")).toBe(false);
  });

  it("does not allow Usuario or Dono to create accounts", () => {
    expect(canCreateRole("Funcionario", "Funcionario")).toBe(false);
    expect(canCreateRole("Dono", "Funcionario")).toBe(false);
  });

  it("accepts only the closed permission level enum", () => {
    for (const invalid of [0, -1, 99, "0", null, undefined, Number.NaN, 1.5]) {
      expect(parseCreatablePermissionLevel(invalid)).toBeNull();
    }
    expect(parseCreatablePermissionLevel(3)).toBe(3);
  });
});
