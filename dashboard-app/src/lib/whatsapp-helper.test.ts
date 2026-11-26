import { describe, it, expect, vi } from "vitest";
import {
  formatWhatsAppPhone,
  formatWhatsAppDate,
  buildAppointmentConfirmationMessage,
  buildAppointmentWhatsAppUrl,
  openWhatsAppConfirmation,
  buildAppointmentReviewWhatsAppMessage,
  buildAppointmentReviewWhatsAppUrl,
  buildAppointmentCancellationMessage,
  buildAppointmentCancellationWhatsAppUrl,
} from "./whatsapp-helper";

describe("whatsapp-helper", () => {
  it("builds a cancellation message with the appointment details and a WhatsApp URL", () => {
    const params = {
      phone: "(62) 99999-9999",
      clientName: "Gabriel Tavares",
      professionalName: "Mariana Costa",
      serviceName: "Consulta Inicial",
      date: "2026-11-26",
      time: "15:00",
    };
    expect(buildAppointmentCancellationMessage(params)).toContain("Gabriel Tavares");
    expect(buildAppointmentCancellationMessage(params)).toContain("26/11/2026");
    expect(decodeURIComponent(buildAppointmentCancellationWhatsAppUrl(params))).toContain("Consulta Inicial");
    expect(buildAppointmentCancellationWhatsAppUrl(params)).toMatch(/^https:\/\/wa\.me\/5562999999999\?text=/);
  });

  it("builds the satisfaction survey message with the portal link", () => {
    const message = buildAppointmentReviewWhatsAppMessage({
      appointmentId: "appointment-1",
      clientName: "Gabriel Tavares",
      professionalName: "Mariana Costa",
      date: "2026-11-26",
      time: "15:00",
    });
    expect(message).toContain("Olá, Gabriel Tavares!");
    expect(message).toContain("atendimento de Mariana Costa em 26/11/2026");
    expect(message).toContain("nota de 1 a 5");
    expect(message).toContain("https://cliente.absalonbeauty.com.br/cliente/painel?avaliar=appointment-1");
  });

  it("creates the satisfaction survey WhatsApp URL with the client phone", () => {
    const url = buildAppointmentReviewWhatsAppUrl({
      appointmentId: "appointment-1",
      phone: "(62) 99999-9999",
      clientName: "Gabriel",
      professionalName: "Mariana",
      date: "2026-11-26",
      time: "15:00",
    });
    expect(url).toMatch(/^https:\/\/wa\.me\/5562999999999\?text=/);
    expect(decodeURIComponent(url)).toContain("cliente.absalonbeauty.com.br");
  });

  describe("formatWhatsAppPhone", () => {
    it("deve retornar vazio se não houver telefone", () => {
      expect(formatWhatsAppPhone(null)).toBe("");
      expect(formatWhatsAppPhone(undefined)).toBe("");
      expect(formatWhatsAppPhone("")).toBe("");
    });

    it("deve adicionar DDI 55 para números de celular brasileiros comuns com 11 dígitos", () => {
      expect(formatWhatsAppPhone("(62) 99999-9999")).toBe("5562999999999");
      expect(formatWhatsAppPhone("62999999999")).toBe("5562999999999");
      expect(formatWhatsAppPhone("(11) 98842-3210")).toBe("5511988423210");
    });

    it("deve adicionar DDI 55 para telefones fixos com 10 dígitos", () => {
      expect(formatWhatsAppPhone("(62) 3210-9999")).toBe("556232109999");
      expect(formatWhatsAppPhone("6232109999")).toBe("556232109999");
    });

    it("deve manter números que já contenham o DDI 55", () => {
      expect(formatWhatsAppPhone("5562999999999")).toBe("5562999999999");
      expect(formatWhatsAppPhone("+55 (62) 99999-9999")).toBe("5562999999999");
    });
  });

  describe("formatWhatsAppDate", () => {
    it("deve formatar data yyyy-mm-dd para dd/mm/yyyy", () => {
      expect(formatWhatsAppDate("2026-08-27")).toBe("27/08/2026");
      expect(formatWhatsAppDate("2026-12-05")).toBe("05/12/2026");
    });

    it("deve retornar a data inalterada caso não seja formato iso yyyy-mm-dd", () => {
      expect(formatWhatsAppDate("27/08/2026")).toBe("27/08/2026");
      expect(formatWhatsAppDate("")).toBe("");
    });
  });

  describe("buildAppointmentConfirmationMessage", () => {
    it("deve formatar a mensagem com saudação personalizada, data, horário e profissional", () => {
      const message = buildAppointmentConfirmationMessage({
        clientName: "João Silva",
        date: "2026-08-27",
        time: "14:30",
        professionalName: "Dra. Paula",
        serviceName: "Corte e Escova",
      });

      expect(message).toContain("Olá, João Silva! Seu agendamento em 27/08/2026 às 14:30 foi confirmado.");
      expect(message).toContain("Profissional: Dra. Paula");
      expect(message).toContain("Serviço: Corte e Escova");
    });

    it("deve usar fallback se não houver nome do profissional ou do cliente", () => {
      const message = buildAppointmentConfirmationMessage({
        date: "2026-08-27",
        time: "10:00",
      });

      expect(message).toContain("Olá! Seu agendamento em 27/08/2026 às 10:00 foi confirmado.");
      expect(message).toContain("Profissional: Equipe da clínica");
    });
  });

  describe("buildAppointmentWhatsAppUrl", () => {
    it("deve gerar URL completa com número e texto codificado", () => {
      const url = buildAppointmentWhatsAppUrl({
        phone: "(62) 99999-9999",
        clientName: "Maria",
        date: "2026-08-27",
        time: "09:00",
        professionalName: "Carlos",
      });

      expect(url).toMatch(/^https:\/\/wa\.me\/5562999999999\?text=/);
      expect(url).toContain(encodeURIComponent("Seu agendamento em 27/08/2026 às 09:00 foi confirmado."));
      expect(url).toContain(encodeURIComponent("Profissional: Carlos"));
    });

    it("deve gerar URL genérica wa.me/?text= caso não tenha telefone", () => {
      const url = buildAppointmentWhatsAppUrl({
        clientName: "Maria",
        date: "2026-08-27",
        time: "09:00",
      });

      expect(url).toMatch(/^https:\/\/wa\.me\/\?text=/);
    });
  });

  describe("openWhatsAppConfirmation", () => {
    it("deve chamar window.open com a URL gerada e opções de segurança", () => {
      const mockOpen = vi.fn();
      Object.defineProperty(globalThis, "window", {
        value: {
          open: mockOpen,
        },
        writable: true,
        configurable: true,
      });

      openWhatsAppConfirmation({
        phone: "(62) 99999-9999",
        date: "2026-08-27",
        time: "15:00",
        professionalName: "Ana",
      });

      expect(mockOpen).toHaveBeenCalledTimes(1);
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining("https://wa.me/5562999999999?text="),
        "_blank",
        "noopener,noreferrer",
      );
    });
  });
});
