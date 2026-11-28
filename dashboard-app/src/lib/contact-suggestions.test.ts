import { describe, expect, it } from "vitest";
import { getContactSuggestions, contactWhatsAppUrl } from "./contact-suggestions";
import type { AppointmentProps } from "@core/application/query/interface/appointment.entity";

const client = { id: "one", name: "Ana", email: "", phone: "(11) 99999-9999", status: "Ativo" as const };
const appointment = (date: string, status: AppointmentProps["status"] = "Concluído", clientId = "one") => ({ id: date, date, time: "10:00", name: "Ana", service: null, duration: "1h", status, initials: "AN", channelId: "x", clientId });
const now = new Date(2026, 10, 28, 12);

describe("contact suggestions", () => {
  it("requires more than 60 calendar days since a past visit", () => {
    expect(getContactSuggestions([client], [appointment("2026-09-29")], now)).toHaveLength(0);
    expect(getContactSuggestions([client], [appointment("2026-09-28")], now)).toHaveLength(1);
  });
  it("ignores cancelled visits and excludes future non-cancelled bookings", () => {
    expect(getContactSuggestions([client], [appointment("2026-08-01"), appointment("2026-11-29", "Confirmado")], now)).toHaveLength(0);
    expect(getContactSuggestions([client], [appointment("2026-08-01"), appointment("2026-11-29", "Cancelado")], now)).toHaveLength(1);
    expect(getContactSuggestions([client], [appointment("2026-08-01", "Cancelado")], now)).toHaveLength(0);
  });
  it("excludes inactive, unlinked and history-free clients", () => {
    expect(getContactSuggestions([{ ...client, status: "Inativo" }], [appointment("2026-08-01")], now)).toHaveLength(0);
    expect(getContactSuggestions([client], [appointment("2026-08-01", "Concluído", "other")], now)).toHaveLength(0);
    expect(getContactSuggestions([client], [], now)).toHaveLength(0);
  });
  it("opens a WhatsApp draft", () => {
    const url = new URL(contactWhatsAppUrl(client.phone, client.name));
    expect(url.pathname).toBe("/5511999999999");
    expect(url.searchParams.get("text")).toContain("Ana");
  });
});
