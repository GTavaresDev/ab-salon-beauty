export class CreateAppointmentDto {
  date!: string;
  time!: string;
  name!: string;
  service!: string;
  duration!: string;
  userId?: string;
  professionalName?: string;
  professionalEmail?: string;
  serviceId?: string;
  clientId?: string;
  statusName?: string;
  channelId?: string;
  notes?: string | null;
}
