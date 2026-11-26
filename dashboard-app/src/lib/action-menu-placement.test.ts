import { describe, expect, it } from "vitest";
import { shouldOpenActionMenuUp } from "./action-menu-placement";

describe("shouldOpenActionMenuUp", () => {
  it("opens upward for the last two rows", () => {
    expect(shouldOpenActionMenuUp(3, 5)).toBe(true);
    expect(shouldOpenActionMenuUp(4, 5)).toBe(true);
  });

  it("opens downward for earlier rows and empty collections", () => {
    expect(shouldOpenActionMenuUp(2, 5)).toBe(false);
    expect(shouldOpenActionMenuUp(0, 0)).toBe(false);
  });
});
