import { BadRequestException } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller.js';

const actor = { sub: 'client-1', issuer: 'client' } as const;
const booking = {
  date: '2099-09-10', time: '10:00', name: 'Cliente', service: 'Avaliação',
  duration: '30 min', serviceId: 'service-1', userId: 'professional-1',
  professionalName: 'Nome falso', professionalEmail: 'falso@example.com',
};

function setup() {
  const create = vi.fn().mockResolvedValue({ id: 'appointment-1' });
  const book = vi.fn().mockResolvedValue({ id: 'appointment-1' });
  const update = vi.fn().mockResolvedValue({ id: 'appointment-1' });
  const execute = vi.fn().mockResolvedValue([{ id: 'professional-1', name: 'Profissional', initials: 'PR' }]);
  const assertOwner = vi.fn().mockResolvedValue(undefined);
  const controller = new AppointmentsController(
    {} as never, {} as never, {} as never,
    { create, book } as never, { update } as never, {} as never,
    { execute } as never, {} as never, { assertOwner } as never,
    {} as never, {} as never,
  );
  return { controller, create, book, update, execute, assertOwner };
}

describe('agendamento de cliente por serviço e profissional', () => {
  it('delega a reserva do cliente autenticado à validação transacional', async () => {
    const { controller, book, execute } = setup();

    await controller.create({ ...booking, clientId: 'outro-cliente' }, actor);

    expect(execute).not.toHaveBeenCalled();
    expect(book).toHaveBeenCalledWith(expect.objectContaining({
      serviceId: 'service-1', userId: 'professional-1', clientId: 'client-1',
      statusName: 'Pendente', channelId: 'site',
    }), actor.sub);
  });

  it('recusa IDs ausentes antes da validação transacional', async () => {
    const { controller, book } = setup();

    await expect(controller.create({ ...booking, userId: undefined }, actor)).rejects.toThrow(BadRequestException);
    await expect(controller.create({ ...booking, serviceId: undefined }, actor)).rejects.toThrow(BadRequestException);
    expect(book).not.toHaveBeenCalled();
  });

  it('reagenda apenas com vínculo válido e ignora nome e e-mail enviados', async () => {
    const { controller, update, execute } = setup();

    await controller.update('appointment-1', undefined, booking, actor);

    expect(execute).toHaveBeenCalledWith('service-1');
    expect(update).toHaveBeenCalledWith('appointment-1', expect.objectContaining({
      serviceId: 'service-1', userId: 'professional-1',
      professionalName: undefined, professionalEmail: undefined,
    }), expect.anything());
  });

  it('recusa reagendamento quando o vínculo foi removido', async () => {
    const { controller, update, execute } = setup();
    execute.mockResolvedValueOnce([]);

    await expect(controller.update('appointment-1', undefined, booking, actor)).rejects.toThrow('Profissional não realiza este serviço.');
    expect(update).not.toHaveBeenCalled();
  });

  it('permite cancelar sem consultar vínculo e mantém agendamentos internos', async () => {
    const { controller, create, update, execute } = setup();

    await controller.update('appointment-1', undefined, { statusName: 'Cancelado' }, actor);
    expect(update).toHaveBeenCalledWith('appointment-1', { statusName: 'Cancelado' }, expect.anything());
    await controller.create({ ...booking, serviceId: undefined }, { sub: 'staff-1', issuer: 'staff' });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'professional-1', serviceId: undefined }));
    expect(execute).not.toHaveBeenCalled();
  });
});
