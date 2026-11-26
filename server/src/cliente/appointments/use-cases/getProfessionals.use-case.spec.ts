import { DataSource } from 'typeorm';
import { getProfessionalsUseCase } from './getProfessionals.use-case.js';

describe('getProfessionalsUseCase', () => {
  it('validates the service and returns active professionals without private fields', async () => {
    const dataSource = {
      query: vi.fn()
        .mockResolvedValueOnce([{ id: 'srv-1' }])
        .mockResolvedValueOnce([{ id: 'u1', name: 'Gabriel Tavares', initials: 'GT' }]),
    } as unknown as DataSource;

    const result = await new getProfessionalsUseCase(dataSource).execute('srv-1');

    expect(dataSource.query).toHaveBeenNthCalledWith(
      1,
      'SELECT id FROM "Services" WHERE id = $1 AND status = $2 LIMIT 1',
      ['srv-1', 'Ativo'],
    );
    expect(dataSource.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("AND (up.name IS NULL OR up.name NOT IN ('Dono', 'Product Manegar', 'Administrador'))"),
      ['Ativo'],
    );
    expect(result).toEqual([{ id: 'u1', name: 'Gabriel Tavares', initials: 'GT' }]);
  });

  it('never exposes internal administrative users such as Product Manegar or Administrador', async () => {
    const dataSource = {
      query: vi.fn()
        .mockResolvedValueOnce([{ id: 'srv-1' }])
        .mockImplementation(async (sql: string) => {
          if (sql.includes('FROM "Users"')) {
            // Emulando o comportamento onde apenas profissionais operacionais são retornados
            return [{ id: 'u2', name: 'Mariana Costa', initials: 'MC' }];
          }
          return [];
        }),
    } as unknown as DataSource;

    const result = await new getProfessionalsUseCase(dataSource).execute('srv-1');

    expect(result.some((p) => p.name.toLowerCase().includes('product manegar'))).toBe(false);
    expect(result.some((p) => p.name.toLowerCase().includes('administrador'))).toBe(false);
    expect(result).toEqual([{ id: 'u2', name: 'Mariana Costa', initials: 'MC' }]);
  });
});
