import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

export type ClientProfessionalResponse = {
  id: string;
  name: string;
  initials: string;
};

type ProfessionalRecord = {
  id: string;
  name: string;
  initials: string;
};

/** Profissionais ativos disponíveis para o serviço selecionado. */
@Injectable()
export class getProfessionalsUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(serviceId: string): Promise<ClientProfessionalResponse[]> {
    if (!serviceId?.trim()) {
      throw new BadRequestException('serviceId é obrigatório.');
    }

    const services = await this.dataSource.query(
      'SELECT id FROM "Services" WHERE id = $1 AND status = $2 LIMIT 1',
      [serviceId, 'Ativo'],
    ) as Array<{ id: string }>;
    if (!services.length) throw new NotFoundException('Serviço indisponível.');

    const professionals = await this.dataSource.query(
      `SELECT u.id, u.name, u.initials
       FROM "Users" u
       WHERE u.status = $1
         AND $2 = ANY(u."serviceIds")
         AND NOT EXISTS (
           SELECT 1 FROM "UserPermissions" up
           WHERE up."userId" = u.id AND up.enabled = true
             AND up.name IN ('Dono', 'Product Manegar', 'Administrador')
         )
       ORDER BY u.name ASC, u.id ASC`,
      ['Ativo', serviceId],
    ) as ProfessionalRecord[];

    return professionals.map(({ id, name, initials }) => ({ id, name, initials }));
  }
}
