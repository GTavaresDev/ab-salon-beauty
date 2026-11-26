import { DataSource } from 'typeorm';
import { getProfessionalsUseCase } from './getProfessionals.use-case.js';

describe('getProfessionalsUseCase', () => {
  it('returns only active professionals linked to the active service, without duplicate rows or private fields', async () => {
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
    const [sql, parameters] = vi.mocked(dataSource.query).mock.calls[1];
    expect(sql).toContain('$2 = ANY(u."serviceIds")');
    expect(sql).not.toContain('u.role');
    expect(sql).not.toContain("'Gestor'");
    expect(sql).toContain('NOT EXISTS');
    expect(sql).toContain("up.name IN ('Dono', 'Product Manegar', 'Administrador')");
    expect(sql).not.toContain('JOIN "UserPermissions" up ON');
    expect(parameters).toEqual(['Ativo', 'srv-1']);
    expect(result).toEqual([{ id: 'u1', name: 'Gabriel Tavares', initials: 'GT' }]);
  });

  it('returns no professionals when none is linked to the service', async () => {
    const dataSource = {
      query: vi.fn()
        .mockResolvedValueOnce([{ id: 'srv-1' }])
        .mockResolvedValueOnce([]),
    } as unknown as DataSource;

    const result = await new getProfessionalsUseCase(dataSource).execute('srv-1');

    expect(result).toEqual([]);
  });
});
