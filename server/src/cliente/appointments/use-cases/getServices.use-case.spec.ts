import { DataSource } from 'typeorm';
import { getServicesUseCase } from './getServices.use-case.js';

describe('getServicesUseCase', () => {
  it('returns active services with an eligible professional in the client contract without prices', async () => {
    const dataSource = {
      query: vi.fn().mockResolvedValue([
        { id: 'service-1', name: 'Botox', description: null, duration: 45 },
      ]),
    } as unknown as DataSource;

    const result = await new getServicesUseCase(dataSource).execute();

    const [sql, parameters] = vi.mocked(dataSource.query).mock.calls[0];
    expect(sql).toContain('WHERE s.status = $1');
    expect(sql).toContain('AND EXISTS (');
    expect(sql).toContain('u.status = $1');
    expect(sql).toContain('s.id = ANY(u."serviceIds")');
    expect(sql).not.toContain('u.role');
    expect(sql).toContain('NOT EXISTS (');
    expect(sql).toContain("up.name IN ('Dono', 'Product Manegar', 'Administrador')");
    expect(parameters).toEqual(['Ativo']);
    expect(result).toEqual([
      { id: 'service-1', name: 'Botox', description: '', durationMinutes: 45 },
    ]);
    expect(result[0]).not.toHaveProperty('price');
  });

  it('returns an empty list when no service has an available professional', async () => {
    const dataSource = { query: vi.fn().mockResolvedValue([]) } as unknown as DataSource;

    expect(await new getServicesUseCase(dataSource).execute()).toEqual([]);
  });
});
