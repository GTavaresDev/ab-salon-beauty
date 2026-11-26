import type { AppointmentProps } from "@core/application/query/interface/appointment.entity";
import type { UserProps } from "@core/application/query/interface/user.entity";

export type CommissionRow = AppointmentProps & {
  percent: number;
  amount: number;
  commission: number;
  professional: string;
};

export function buildCommissionRows(
  appointments: AppointmentProps[],
  users: UserProps[],
  filters: { professional?: string; from?: string; to?: string } = {},
): CommissionRow[] {
  return appointments
    .filter((appointment) => appointment.status === "Concluído")
    .map((appointment) => {
      const user = users.find((item) => item.id === appointment.userId)
        || users.find((item) => item.name === appointment.userName);
      const percent = appointment.commissionPercent ?? 0;
      const amount = Number(appointment.servicePrice) || 0;
      return {
        ...appointment,
        percent,
        amount,
        commission: amount * percent / 100,
        professional: user?.name || appointment.userName || "Não informado",
      };
    })
    .filter((row) => (!filters.professional || row.userId === filters.professional)
      && (!filters.from || row.date >= filters.from)
      && (!filters.to || row.date <= filters.to))
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
}

export function buildCommissionCsv(rows: CommissionRow[]): string {
  const header = ["Data", "Horário", "Procedimento", "Cliente", "Profissional", "Valor", "Pagamento", "Percentual", "Comissão"];
  const body = rows.map((row) => [
    new Date(`${row.date}T00:00:00`).toLocaleDateString("pt-BR"),
    row.time,
    row.service || "Não informado",
    row.name,
    row.professional,
    row.amount.toFixed(2).replace(".", ","),
    row.paymentMethod || "Não informado",
    `${row.percent}%`,
    row.commission.toFixed(2).replace(".", ","),
  ]);
  return "\uFEFF" + [header, ...body]
    .map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(";"))
    .join("\n");
}
