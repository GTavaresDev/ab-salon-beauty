// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { ContactSuggestions } from "./contact-suggestions.component";

it("navigates one client at a time and keeps the WhatsApp draft available", () => {
  render(<ContactSuggestions suggestions={[
    { client: { id: "a", name: "Ana", email: "", phone: "11999999999", status: "Ativo" }, lastVisit: "2026-08-01" },
    { client: { id: "b", name: "Bia", email: "", phone: "11888888888", status: "Ativo" }, lastVisit: "2026-08-02" },
  ]} />);
  expect(screen.getByText("Ana")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Próxima sugestão" }));
  expect(screen.getByText("Bia")).toBeTruthy();
  expect(screen.getByText("Última visita")).toBeTruthy();
  expect(screen.getByText("02/08/2026")).toBeTruthy();
  expect(screen.getByRole("link", { name: "Contatar pelo WhatsApp" }).getAttribute("href")).toContain("wa.me/5511888888888");
  fireEvent.click(screen.getByRole("button", { name: "Sugestão anterior" }));
  expect(screen.getByText("Ana")).toBeTruthy();
});
