import { occupiedSlots } from "@core/server/rule/appointment-duration";
export { ALL_TIMES } from "@core/server/rule/booking-grid";

export interface AppointmentProps {
  id: string;
  date: string;
  time: string;
  name: string;
  service: string | null;
  serviceId?: string | null;
  servicePrice?: number | null;
  serviceColor?: string | null;
  commissionPercent?: number | null;
  paymentMethod?: "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência" | "Outro" | null;
  duration: string;
  status: "Confirmado" | "Pendente" | "Concluído" | "Cancelado";
  statusId?: string | null;
  initials: string;
  channelId: string;
  notes?: string | null;
  userId?: string | null;
  clientId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  clientPhone?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Appointment {
  private props: AppointmentProps;

  constructor(props: AppointmentProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: AppointmentProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Nome do cliente é obrigatório no agendamento.");
    }
    if (!props.time) {
      throw new Error("Horário do agendamento é obrigatório.");
    }
  }

  get id(): string {
    return this.props.id;
  }
  get date(): string {
    return this.props.date;
  }
  get time(): string {
    return this.props.time;
  }
  get name(): string {
    return this.props.name;
  }
  get service(): string | null {
    return this.props.service;
  }
  get serviceId(): string | null | undefined {
    return this.props.serviceId;
  }
  get servicePrice(): number | null | undefined {
    return this.props.servicePrice;
  }
  get serviceColor(): string | null | undefined {
    return this.props.serviceColor;
  }
  get commissionPercent(): number | null | undefined {
    return this.props.commissionPercent;
  }
  get paymentMethod(): AppointmentProps["paymentMethod"] {
    return this.props.paymentMethod;
  }
  get duration(): string {
    return this.props.duration;
  }
  get status(): "Confirmado" | "Pendente" | "Concluído" | "Cancelado" {
    return this.props.status;
  }
  get statusId(): string | null | undefined {
    return this.props.statusId;
  }
  get initials(): string {
    return this.props.initials;
  }
  get channelId(): string {
    return this.props.channelId;
  }
  get notes(): string | null | undefined {
    return this.props.notes;
  }
  get userId(): string | null | undefined {
    return this.props.userId;
  }
  get clientId(): string | null | undefined {
    return this.props.clientId;
  }
  get userName(): string | null | undefined {
    return this.props.userName;
  }
  get userRole(): string | null | undefined {
    return this.props.userRole;
  }
  get clientPhone(): string | null | undefined {
    return this.props.clientPhone;
  }
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  public toJSON(): AppointmentProps {
    return { ...this.props };
  }

  public static generateInitials(name: string): string {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "A";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  public static getOccupiedSlots(startTime: string, duration: string): string[] {
    return occupiedSlots(startTime, duration);
  }
}
