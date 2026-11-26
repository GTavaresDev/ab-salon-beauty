import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { hasPortalAccess } from '../src/security/client/portal-access.js';

const url = new URL(process.env.TEST_DATABASE_URL ?? 'about:blank');
if (url.protocol !== 'postgresql:' || url.hostname !== '127.0.0.1' || url.pathname !== '/salon_fixture_test' || url.search || url.hash) {
  throw new Error('Banco local de teste obrigatório.');
}

const db = new DataSource({ type: 'postgres', url: url.href });
const createdClientIds: string[] = [];

beforeAll(async () => {
  await db.initialize();
});

afterAll(async () => {
  try {
    if (createdClientIds.length) {
      await db.query('DELETE FROM "Clients" WHERE id = ANY($1)', [createdClientIds]);
    }
  } finally {
    await db.destroy();
  }
});

it('parametriza consulta de acesso ao portal na API de agenda contra strings com sintaxe SQL', async () => {
  const victimId = randomUUID();
  await db.query(
    'INSERT INTO "Clients" (id, name, email, phone, initials, status, "portalAccess", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
    [victimId, 'Vitima API', `${victimId}@example.invalid`, '11999990000', 'VA', 'Ativo', 'IN_REVIEW'],
  );
  createdClientIds.push(victimId);

  const payloads = [
    "' OR '1'='1",
    "'; UPDATE \"Clients\" SET \"portalAccess\" = 'APPROVED'; --",
    `${victimId}' OR '1'='1`,
  ];

  for (const payload of payloads) {
    expect(await hasPortalAccess(db, payload)).toBe(false);
  }

  const rows = await db.query('SELECT "portalAccess" FROM "Clients" WHERE id = $1', [victimId]);
  expect(rows[0].portalAccess).toBe('IN_REVIEW');
});
