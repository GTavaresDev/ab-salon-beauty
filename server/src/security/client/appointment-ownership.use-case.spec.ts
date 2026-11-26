import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AppointmentOwnershipUseCase, assertSubmittedClientId } from './appointment-ownership.use-case.js';

describe('AppointmentOwnershipUseCase', () => {
  const appointment = (clientId: string) => ({ clientId });
  const repository = { findOne: vi.fn() };
  const useCase = () => new AppointmentOwnershipUseCase(repository as never);

  beforeEach(() => vi.clearAllMocks());

  it('allows the owner to update or delete', async () => {
    repository.findOne.mockResolvedValue(appointment('client-a'));
    await expect(useCase().assertOwner('appointment-1', 'client-a')).resolves.toBeUndefined();
  });

  it('blocks another client with 403', async () => {
    repository.findOne.mockResolvedValue(appointment('client-b'));
    await expect(useCase().assertOwner('appointment-1', 'client-a')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns 404 when the appointment does not exist', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(useCase().assertOwner('missing', 'client-a')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects a clientId sent in the body or query when it differs from the token', () => {
    expect(() => assertSubmittedClientId({ issuer: 'client', sub: 'client-a' }, 'client-b'))
      .toThrow(ForbiddenException);
  });
});
