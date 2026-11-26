import { describe, expect, it } from "vitest";
import type { AppointmentProps } from "@core/application/query/interface/appointment.entity";
import { buildCommissionCsv, buildCommissionRows } from "./commission-report";

const base: AppointmentProps = {
  id: "old", date: "2026-11-25", time: "15:00", name: "Cliente", service: "Consulta",
  duration: "30 min", status: "Concluído", initials: "CL", channelId: "site",
  userId: "staff-1", userName: "Mariana", servicePrice: 200, commissionPercent: 25, paymentMethod: "Pix",
};

describe("commission report", () => {
  it("filters completed appointments and sorts newest date/time first using the captured percentage", () => {
    const rows = buildCommissionRows([
      base,
      { ...base, id: "later-time", time: "17:00" },
      { ...base, id: "newer-day", date: "2026-11-26", time: "09:00" },
      { ...base, id: "upcoming", status: "Confirmado" },
    ], [{ id: "staff-1", name: "Mariana" } as never]);

    expect(rows.map((row) => row.id)).toEqual(["newer-day", "later-time", "old"]);
    expect(rows[0]).toMatchObject({ professional: "Mariana", percent: 25, amount: 200, commission: 50 });
  });

  it("applies professional and inclusive date filters", () => {
    const rows = buildCommissionRows([
      base,
      { ...base, id: "other-staff", userId: "staff-2" },
      { ...base, id: "before", date: "2026-11-24" },
    ], [], { professional: "staff-1", from: "2026-11-25", to: "2026-11-25" });
    expect(rows.map((row) => row.id)).toEqual(["old"]);
  });

  it("exports rows in supplied order with payment method and legacy fallback", () => {
    const rows = buildCommissionRows([
      { ...base, id: "old", paymentMethod: null },
      { ...base, id: "new", date: "2026-11-26", paymentMethod: "Pix" },
    ], []);
    const csv = buildCommissionCsv(rows);
    const lines = csv.replace(/^\uFEFF/, "").split("\n");
    expect(lines[1]).toContain("26/11/2026");
    expect(lines[1]).toContain("Pix");
    expect(lines[2]).toContain("Não informado");
  });
});
