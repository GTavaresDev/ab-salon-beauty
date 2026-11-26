import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export type ClientServiceResponse = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
};

type ServiceRecord = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
};

/** Serviços ativos e seguros para seleção no portal do cliente. */
@Injectable()
export class getServicesUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(): Promise<ClientServiceResponse[]> {
    const services = await this.dataSource.query(
      'SELECT id, name, description, duration FROM "Services" WHERE status = $1 ORDER BY name ASC',
      ['Ativo'],
    ) as ServiceRecord[];

    return services.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description ?? '',
      durationMinutes: service.duration,
    }));
  }
}
