import { describe, expect, it } from "vitest";
import { requireSeedPassword, requireSeedPasswords } from "./seed-password.business-rule";

describe("seed password requirements", () => {
  it("aborts when a required environment variable is missing", () => {
    expect(() => requireSeedPassword({}, "SEED_ADMIN_PASSWORD")).toThrow(/SEED_ADMIN_PASSWORD/);
  });

  it("aborts when a password is too short without including its value", () => {
    expect(() => requireSeedPassword({ SEED_ADMIN_PASSWORD: "short" }, "SEED_ADMIN_PASSWORD"))
      .toThrow(/pelo menos 16 caracteres/);
  });

  it("requires each configured seed account password", () => {
    expect(() => requireSeedPasswords({ SEED_ADMIN_PASSWORD: "A-valid-password-123" }, [
      "SEED_ADMIN_PASSWORD", "SEED_USER_PASSWORD",
    ])).toThrow(/SEED_USER_PASSWORD/);
  });
});
