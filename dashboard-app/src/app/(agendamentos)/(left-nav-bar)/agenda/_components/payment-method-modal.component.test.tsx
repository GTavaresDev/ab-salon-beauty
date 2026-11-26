// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AppointmentProps } from "@core/application/query/interface/appointment.entity";
import { PaymentMethodModal } from "./payment-method-modal.component";

const appointment: AppointmentProps = {
  id: "a-1", date: "2026-11-26", time: "15:00", name: "Cliente", service: "Consulta",
  duration: "30 min", status: "Confirmado", initials: "CL", channelId: "site",
};

describe("PaymentMethodModal", () => {
  it("offers the six supported methods, requires a selection, and submits it", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    const onClose = vi.fn();
    render(<PaymentMethodModal appointment={appointment} onSubmit={onSubmit} onClose={onClose} />);

    expect(screen.getByRole("button", { name: "Concluir atendimento" })).toBeDisabled();
    const selector = screen.getByRole("combobox", { name: "Método de pagamento" });
    expect(Array.from((selector as HTMLSelectElement).options).map((option) => option.value)).toEqual([
      "", "Pix", "Dinheiro", "Crédito", "Débito", "Transferência", "Outro",
    ]);
    fireEvent.change(selector, { target: { value: "Pix" } });
    fireEvent.click(screen.getByRole("button", { name: "Concluir atendimento" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("Pix"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("keeps the modal open and permits a retry after a recoverable error", async () => {
    const onSubmit = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const onClose = vi.fn();
    render(<PaymentMethodModal appointment={appointment} onSubmit={onSubmit} onClose={onClose} />);
    fireEvent.change(screen.getByRole("combobox", { name: "Método de pagamento" }), { target: { value: "Dinheiro" } });

    fireEvent.click(screen.getByRole("button", { name: "Concluir atendimento" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("tente novamente");
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Concluir atendimento" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it("closes without submitting when cancelled", () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(<PaymentMethodModal appointment={appointment} onSubmit={onSubmit} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
