import { DataSource } from 'typeorm';
import { getProfessionalsUseCase } from './getProfessionals.use-case.js';

describe('getProfessionalsUseCase', () => {
  it('validates the service and returns active professionals without private fields', async () => {
    const dataSource = {
      query: vi.fn()
        .mockResolvedValueOnce([{ id: 'srv-1' }])
        .mockResolvedValueOnce([{ id: 'u1', name: 'Gabriel Tavares', initials: 'GT', email: 'private@example.com' }]),
    } as unknown as DataSource;

    const result = await new getProfessionalsUseCase(dataSource).execute('srv-1');

    expect(dataSource.query).toHaveBeenNthCalledWith(
      1,
      'SELECT id FROM "Services" WHERE id = $1 AND status = $2 LIMIT 1',
      ['srv-1', 'Ativo'],
    );
    expect(dataSource.query).toHaveBeenNthCalledWith(
      2,
      'SELECT id, name, initials FROM "Users" WHERE status = $1 ORDER BY name ASC',
      ['Ativo'],
    );
    expect(result).toEqual([{ id: 'u1', name: 'Gabriel Tavares', initials: 'GT' }]);
    expect(result[0]).not.toHaveProperty('email');
  });
});
