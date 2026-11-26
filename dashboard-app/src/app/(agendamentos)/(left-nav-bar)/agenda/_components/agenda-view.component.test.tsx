// @vitest-environment jsdom
import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import type { AppointmentProps } from "@core/application/query/interface/appointment.entity";
import { AgendaView } from "./agenda-view.component";

const appointment: AppointmentProps = {
  id: "a-1", date: "2099-11-27", time: "08:00", name: "Cliente", service: "Consulta",
  duration: "30 min", status: "Confirmado", initials: "C", channelId: "site",
};

vi.mock("../hooks/use-agenda-view", () => ({
  useAgendaView: () => {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    return {
      openMenuId, setOpenMenuId, serviceList: [], selectedIso: appointment.date, todayIso: appointment.date,
      pendingAppointments: [], pagedAppointments: [appointment], filteredAppointments: [appointment],
      channelMap: new Map(), markedDates: new Set(), page: 1, dateAppointmentsCount: 1,
    };
  },
}));

it.each([
  { buttonTop: 120, edge: "top", offset: 156 },
  { buttonTop: 730, edge: "bottom", offset: 46 },
])("ancora o menu da única linha fora da área rolável, usando $edge", ({ buttonTop, edge, offset }) => {
  vi.stubGlobal("innerHeight", 768);
  try {
    const view = render(<AgendaView appointments={[appointment]} onStatusChange={vi.fn()} onNew={vi.fn()} showToast={vi.fn()} />);
    const [trigger] = screen.getAllByRole("button", { name: "Ações de Cliente" });
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue(new DOMRect(500, buttonTop, 28, 28));

    fireEvent.click(trigger);

    const menu = screen.getByRole("group", { name: "Ações de Cliente" });
    expect(menu.parentElement).toBe(document.body);
    expect(view.container).not.toContainElement(menu);
    expect(menu.style.getPropertyValue(edge)).toBe(`${offset}px`);
    expect(within(menu).getByRole("button", { name: "Cancelar" })).toBeVisible();

    fireEvent.scroll(trigger.closest(".overflow-y-auto")!);
    expect(menu).not.toBeInTheDocument();
  } finally {
    vi.unstubAllGlobals();
  }
});
