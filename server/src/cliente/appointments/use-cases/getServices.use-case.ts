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

/** Serviços ativos com ao menos um profissional disponível para seleção no portal do cliente. */
@Injectable()
export class getServicesUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(): Promise<ClientServiceResponse[]> {
    const services = await this.dataSource.query(
      `SELECT s.id, s.name, s.description, s.duration
       FROM "Services" s
       WHERE s.status = $1
         AND EXISTS (
           SELECT 1 FROM "Users" u
           WHERE u.status = $1
             AND s.id = ANY(u."serviceIds")
             AND NOT EXISTS (
               SELECT 1 FROM "UserPermissions" up
               WHERE up."userId" = u.id AND up.enabled = true
                 AND up.name IN ('Dono', 'Product Manegar', 'Administrador')
             )
         )
       ORDER BY s.name ASC`,
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
