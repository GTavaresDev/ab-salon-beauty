export interface ClientAppointmentDTO {
  id: string;
  date: string;
  time: string;
  serviceName: string;
  duration: string;
  professionalName: string | null;
  status: "Confirmado" | "Pendente" | "Concluído" | "Cancelado";
  canCancel: boolean;
}

export interface ClientAppointmentsView {
  upcoming: ClientAppointmentDTO[];
  past: ClientAppointmentDTO[];
  next: ClientAppointmentDTO | null;
}

export function toClientAppointmentDTO(input: {
  id: string; date: string; time: string; service?: string | null; serviceName?: string;
  duration: string; status?: string; statusName?: string; userName?: string | null;
  professionalName?: string | null;
}, now = new Date()): ClientAppointmentDTO {
  const status = (input.statusName ?? input.status ?? "Confirmado") === "Aguardando confirmação"
    ? "Pendente"
    : (input.statusName ?? input.status ?? "Confirmado") as ClientAppointmentDTO["status"];
  const start = new Date(`${input.date}T${input.time}:00`);
  const canCancel = status !== "Cancelado" && status !== "Concluído" && now.getTime() < start.getTime();
  return {
    id: input.id, date: input.date, time: input.time,
    serviceName: input.serviceName ?? input.service ?? "Atendimento",
    duration: input.duration.replace(/\s*\(.*\)\s*/, "").trim(),
    professionalName: input.professionalName ?? input.userName ?? null,
    status, canCancel,
  };
}
