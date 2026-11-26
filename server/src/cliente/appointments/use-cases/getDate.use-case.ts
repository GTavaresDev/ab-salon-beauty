import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

const BOOKING_WINDOW_DAYS = 14;
const SLOT_MINUTES = 30;
const TIMES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30',
];

type ServiceRecord = { duration: number; status: string };
type AppointmentRecord = {
  id: string; date: string; time: string; duration: string;
  status: string; name: string; clientId: string | null;
};

/** Retorna os dias que possuem ao menos um horário livre para o cliente. */
@Injectable()
export class getDateUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(serviceId: string, clientId: string): Promise<string[]> {
    if (!serviceId?.trim()) throw new BadRequestException('serviceId é obrigatório.');

    const services = await this.dataSource.query(
      'SELECT duration, status FROM "Services" WHERE id = $1 LIMIT 1',
      [serviceId],
    ) as ServiceRecord[];
    const service = services[0];
    if (!service || service.status !== 'Ativo') throw new NotFoundException('Serviço indisponível.');
    if (!Number.isFinite(service.duration) || service.duration <= 0 || service.duration > 90) return [];

    const clientRows = await this.dataSource.query(
      'SELECT name FROM "Clients" WHERE id = $1 LIMIT 1',
      [clientId],
    ) as Array<{ name: string }>;
    const clientName = clientRows[0]?.name ?? '';
    const today = new Date();
    const start = this.toIsoDate(today);
    const endDate = this.addDays(today, BOOKING_WINDOW_DAYS - 1);
    const appointments = await this.dataSource.query(
      'SELECT id, date, time, duration, status, name, "clientId" FROM "Appointments" WHERE date >= $1 AND date <= $2',
      [start, this.toIsoDate(endDate)],
    ) as AppointmentRecord[];

    const result: string[] = [];
    for (let offset = 0; offset < BOOKING_WINDOW_DAYS; offset += 1) {
      const date = this.toIsoDate(this.addDays(today, offset));
      if (this.availableTimes(appointments, date, service.duration, clientId, clientName, today).length) result.push(date);
    }
    return result;
  }

  async executeTimes(serviceId: string, date: string, clientId: string): Promise<string[]> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new BadRequestException('Data inválida.');
    const services = await this.dataSource.query('SELECT duration, status FROM "Services" WHERE id = $1 LIMIT 1', [serviceId]) as ServiceRecord[];
    const service = services[0];
    if (!service || service.status !== 'Ativo') throw new NotFoundException('Serviço indisponível.');
    const clientRows = await this.dataSource.query('SELECT name FROM "Clients" WHERE id = $1 LIMIT 1', [clientId]) as Array<{ name: string }>;
    const appointments = await this.dataSource.query('SELECT id, date, time, duration, status, name, "clientId" FROM "Appointments" WHERE date = $1', [date]) as AppointmentRecord[];
    return this.availableTimes(appointments, date, service.duration, clientId, clientRows[0]?.name ?? '', new Date());
  }

  private availableTimes(rows: AppointmentRecord[], date: string, minutes: number, clientId: string, clientName: string, now: Date) {
    const requiredSlots = Math.ceil(minutes / SLOT_MINUTES);
    if (requiredSlots > 3) return [];
    const dayRows = rows.filter((row) => row.date === date);
    const occupied = new Set<string>();
    for (const row of dayRows) {
      if (row.status === 'Cancelado') continue;
      for (const slot of this.slots(row.time, this.durationMinutes(row.duration))) occupied.add(slot);
    }
    return TIMES.filter((time) => {
      if (date === this.toIsoDate(now) && this.toMinutes(time) <= now.getHours() * 60 + now.getMinutes() + 5) return false;
      const required = this.slots(time, minutes);
      if (required.length !== requiredSlots || required.some((slot) => occupied.has(slot))) return false;
      return !dayRows.some((row) => row.status !== 'Cancelado' && (row.clientId === clientId || (!row.clientId && row.name.trim().toLowerCase() === clientName.trim().toLowerCase())) && this.slots(row.time, this.durationMinutes(row.duration)).some((slot) => required.includes(slot)));
    });
  }

  private slots(time: string, minutes: number) {
    const index = TIMES.indexOf(time);
    if (index < 0) return [];
    const start = this.toMinutes(time);
    return TIMES.slice(index, index + Math.ceil(minutes / SLOT_MINUTES)).filter((slot, offset) => this.toMinutes(slot) === start + offset * SLOT_MINUTES);
  }

  private durationMinutes(value: string) {
    const match = /^(\d+)/.exec(value ?? '');
    return match ? Number(match[1]) : SLOT_MINUTES;
  }

  private toMinutes(value: string) { const [hour, minute] = value.split(':').map(Number); return hour * 60 + minute; }
  private toIsoDate(value: Date) { return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`; }
  private addDays(value: Date, days: number) { const result = new Date(value); result.setDate(result.getDate() + days); return result; }
}
