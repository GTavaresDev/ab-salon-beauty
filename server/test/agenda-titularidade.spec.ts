import { ForbiddenException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { describe, expect, it, vi } from 'vitest';
import { Appointment } from '../src/cliente/appointments/entities/appointment.entity.js';
import { getAppointmentsByClientUseCase } from '../src/cliente/appointments/use-cases/getAppointmentsByClient.use-case.js';
import { clientAgendaScope } from '../src/security/client/client-agenda.guard.js';

describe('Titularidade na listagem da agenda', () => {
  const find = vi.fn().mockResolvedValue([]);
  const listagem = new getAppointmentsByClientUseCase({ find } as unknown as Repository<Appointment>);

  it('rejeita outro titular antes de consultar a agenda', async () => {
    find.mockClear();
    const scope = clientAgendaScope({ issuer: 'client', sub: 'cliente-a' });
    await expect(listagem.findByClient('cliente-b', scope)).rejects.toThrow(ForbiddenException);
    expect(find).not.toHaveBeenCalled();
  });

  it('consulta a própria agenda pelo titular autenticado', async () => {
    const scope = clientAgendaScope({ issuer: 'client', sub: 'cliente-a' });
    await listagem.findByClient('cliente-a', scope);
    expect(find).toHaveBeenLastCalledWith(expect.objectContaining({ where: { clientId: 'cliente-a' } }));
  });

  it('combina o cliente solicitado e o escopo do profissional', async () => {
    const scope = clientAgendaScope({ issuer: 'staff', sub: 'profissional-a', role: 'Funcionario' });
    await listagem.findByClient('cliente-b', scope);
    expect(find).toHaveBeenLastCalledWith(expect.objectContaining({
      where: { clientId: 'cliente-b', userId: 'profissional-a' },
    }));
  });
});
