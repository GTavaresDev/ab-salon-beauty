import { describe, expect, it } from "vitest";
import { getUserPasswordRequirements, isValidUserPassword } from "./user-password-policy";

describe("user password policy", () => {
  it("requires length, uppercase letter, number, and special character", () => {
    expect(isValidUserPassword("SenhaForte1!")).toBe(true);
    expect(isValidUserPassword("senhaforte1!")).toBe(false);
    expect(isValidUserPassword("SenhaForte!!")).toBe(false);
    expect(isValidUserPassword("SenhaForte1")).toBe(false);
    expect(isValidUserPassword("Senha1!")).toBe(false);
  });

  it("reports each incomplete requirement", () => {
    const requirements = getUserPasswordRequirements("senha");

    expect(requirements.find((requirement) => requirement.id === "length")?.met).toBe(false);
    expect(requirements.find((requirement) => requirement.id === "uppercase")?.met).toBe(false);
    expect(requirements.find((requirement) => requirement.id === "number")?.met).toBe(false);
    expect(requirements.find((requirement) => requirement.id === "special")?.met).toBe(false);
  });
});
