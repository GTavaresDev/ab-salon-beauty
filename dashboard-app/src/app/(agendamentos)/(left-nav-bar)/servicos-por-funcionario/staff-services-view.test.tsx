// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StaffServicesView } from "./staff-services-view";

const { replaceAssignments } = vi.hoisted(() => ({ replaceAssignments: vi.fn() }));
vi.mock("@core/application/query/controller/users/user-services.controller", () => ({
  replaceUserServicesAction: replaceAssignments,
}));
vi.mock("@/stores/app-shell.store", () => ({
  useAppShellStore: (selector: (state: { showToast: () => void }) => unknown) =>
    selector({ showToast: vi.fn() }),
}));

const users = [
  { id: "u1", name: "Gabriel", email: "gabriel1@example.com", initials: "GT", role: "Gestor" as const, serviceIds: [] },
  { id: "u2", name: "Gabriel", email: "gabriel2@example.com", initials: "GT", role: "Funcionario" as const, serviceIds: [] },
];
const services = [{ id: "srv-1", name: "Avaliação", duration: 30 }];

describe("StaffServicesView matrix", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    replaceAssignments.mockImplementation(async ({ serviceIds }: { serviceIds: string[] }) => ({
      success: true,
      data: serviceIds,
    }));
  });

  it("toggles one employee's service without changing another account with the same name", async () => {
    render(<StaffServicesView users={users} services={services} />);
    expect(screen.getByRole("columnheader", { name: "Avaliação" })).toBeTruthy();
    expect(screen.getByText("2 profissionais")).toBeTruthy();
    expect(screen.getByText("Gestor")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Vincular Avaliação a Gabriel (gabriel1@example.com)" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Desvincular Avaliação de Gabriel (gabriel1@example.com)" }).getAttribute("aria-pressed")).toBe("true");
    });
    expect(screen.getByRole("button", { name: "Vincular Avaliação a Gabriel (gabriel2@example.com)" }).getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(screen.getByRole("button", { name: "Desvincular Avaliação de Gabriel (gabriel1@example.com)" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Vincular Avaliação a Gabriel (gabriel1@example.com)" }).getAttribute("aria-pressed")).toBe("false");
    });
    expect(replaceAssignments).toHaveBeenNthCalledWith(1, { userId: "u1", serviceIds: ["srv-1"] });
    expect(replaceAssignments).toHaveBeenNthCalledWith(2, { userId: "u1", serviceIds: [] });
  });
});
