import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { availableStarts, BOOKABLE_CATALOG, bookingDays, durationBlocks, readOccupancy } from './booking-availability.js';

type CatalogRow = {
  serviceId: string;
  serviceName: string;
  description: string | null;
  duration: number;
  professionalId: string;
  professionalName: string;
  initials: string;
};

@Injectable()
export class getDateUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async prefetch() {
    const now = new Date();
    const days = bookingDays(now);
    const [catalog, occupancy] = await Promise.all([
      this.dataSource.query<CatalogRow[]>(`
        SELECT s.id AS "serviceId", s.name AS "serviceName", s.description, s.duration,
               u.id AS "professionalId", u.name AS "professionalName", u.initials
        ${BOOKABLE_CATALOG}
        AND s.duration BETWEEN 1 AND 90
        ORDER BY s.name, s.id, u.name, u.id
      `),
      readOccupancy(this.dataSource, days[0], days[days.length - 1]),
    ]);

    const availability: Record<number, Record<string, string[]>> = {};
    for (const blocks of new Set(catalog.map(({ duration }) => durationBlocks(duration)))) {
      availability[blocks] = {};
      for (const date of days) {
        const times = availableStarts(date, blocks, occupancy.get(date), now);
        if (times.length) availability[blocks][date] = times;
      }
    }
    return { catalog, availability };
  }

  async execute(serviceId: string, _clientId: string): Promise<string[]> {
    const blocks = await this.serviceBlocks(serviceId);
    if (!blocks) return [];
    const now = new Date();
    const days = bookingDays(now);
    const occupied = await readOccupancy(this.dataSource, days[0], days[days.length - 1]);
    return days.filter((date) => availableStarts(date, blocks, occupied.get(date), now).length);
  }

  async executeTimes(serviceId: string, date: string, _clientId: string): Promise<string[]> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new BadRequestException('Data inválida.');
    const blocks = await this.serviceBlocks(serviceId);
    if (!blocks) return [];
    const occupied = await readOccupancy(this.dataSource, date, date);
    return availableStarts(date, blocks, occupied.get(date), new Date());
  }

  private async serviceBlocks(serviceId: string): Promise<number> {
    if (!serviceId?.trim()) throw new BadRequestException('serviceId é obrigatório.');
    const [service] = await this.dataSource.query<Array<{ duration: number }>>(
      'SELECT duration FROM "Services" WHERE id = $1 AND status = $2',
      [serviceId, 'Ativo'],
    );
    if (!service) throw new NotFoundException('Serviço indisponível.');
    return durationBlocks(service.duration);
  }
}
