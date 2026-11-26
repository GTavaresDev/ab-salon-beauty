// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClientsTable } from "./clients-table.component";

const clients = [
  { id: "c1", name: "Ana Silva", email: "ana@example.com", phone: "11900000001", status: "Ativo" as const },
  { id: "c2", name: "Bruno Lima", email: "bruno@example.com", phone: "11900000002", status: "Ativo" as const },
];

describe("ClientsTable action menu", () => {
  it("opens outside the scrolling table below the first row and keeps its actions available", () => {
    const onEdit = vi.fn();
    render(<ClientsTable
      clients={clients} filteredCount={clients.length} appointmentList={[]} page={1}
      onPageChange={vi.fn()} onEdit={onEdit} onToggleStatus={vi.fn()} onDelete={vi.fn()}
      canViewBirthDate
    />);
    const trigger = screen.getAllByRole("button", { name: "Ações de Ana Silva" })[0];
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      top: 300, bottom: 330, right: 600, left: 568, width: 32, height: 30, x: 568, y: 300, toJSON: () => ({}),
    });

    fireEvent.click(trigger);

    const menu = screen.getByRole("menu", { name: "Ações de Ana Silva" });
    expect(menu.parentElement).toBe(document.body);
    expect(menu).toHaveStyle({ top: "338px" });
    fireEvent.click(screen.getByRole("menuitem", { name: "Editar" }));
    expect(onEdit).toHaveBeenCalledWith(clients[0]);
  });
});
