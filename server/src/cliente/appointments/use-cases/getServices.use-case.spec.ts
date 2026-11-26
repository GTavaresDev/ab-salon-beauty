import { DataSource } from 'typeorm';
import { getServicesUseCase } from './getServices.use-case.js';

describe('getServicesUseCase', () => {
  it('returns active services in the client contract without prices', async () => {
    const dataSource = {
      query: vi.fn().mockResolvedValue([
        { id: 'service-1', name: 'Botox', description: null, duration: 45 },
      ]),
    } as unknown as DataSource;

    const result = await new getServicesUseCase(dataSource).execute();

    expect(dataSource.query).toHaveBeenCalledWith(
      'SELECT id, name, description, duration FROM "Services" WHERE status = $1 ORDER BY name ASC',
      ['Ativo'],
    );
    expect(result).toEqual([
      { id: 'service-1', name: 'Botox', description: '', durationMinutes: 45 },
    ]);
    expect(result[0]).not.toHaveProperty('price');
  });
});
