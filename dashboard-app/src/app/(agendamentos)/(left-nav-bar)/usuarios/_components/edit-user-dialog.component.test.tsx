// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { StaffRole, UserProps } from "@core/application/query/interface/user.entity";
import { updateUserAction } from "@core/application/query/controller/users/user.controller";
import { EditUserDialog } from "./edit-user-dialog.component";

vi.mock("@core/application/query/controller/users/user.controller", () => ({
  updateUserAction: vi.fn(),
}));

const manager: UserProps = {
  id: "manager",
  name: "Pessoa Gestora",
  email: "gestor@example.com",
  phone: "",
  initials: "PG",
  role: "Gestor",
  status: "Ativo",
};

function renderDialog(user: UserProps, currentUserRole: StaffRole = "Administrador") {
  render(<EditUserDialog
    user={user}
    currentUserRole={currentUserRole}
    canEditUser
    canEditProfile
    canEditPermissions
    onUserUpdated={vi.fn()}
    onClose={vi.fn()}
    showToast={vi.fn()}
  />);
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("controle de relatórios na edição de funcionários", () => {
  it.each([
    ["Administrador", "Funcionario"],
    ["Administrador", "Administrador"],
    ["Gestor", "Gestor"],
    ["Funcionario", "Gestor"],
  ] as const)("oculta o controle para %s editando %s", (actor, target) => {
    renderDialog({ ...manager, role: target }, actor);
    expect(screen.queryByRole("checkbox", { name: "Ver relatórios" })).toBeNull();
  });

  it.each([false, true])("envia a alteração para o Gestor com acesso inicial %s", async (viewReports) => {
    vi.mocked(updateUserAction).mockResolvedValue({ success: true, data: manager });
    renderDialog({
      ...manager,
      permissions: [{ id: 1, userId: manager.id, name: "Gestor", enabled: true, viewReports }],
    });

    const checkbox = screen.getByRole<HTMLInputElement>("checkbox", { name: "Ver relatórios" });
    expect(checkbox.checked).toBe(viewReports);
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => expect(updateUserAction).toHaveBeenCalledWith(expect.objectContaining({
      id: manager.id,
      viewReports: !viewReports,
    })));
  });
});
