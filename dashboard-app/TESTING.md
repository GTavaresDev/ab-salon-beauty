# Testes

O projeto separa verificações rápidas de domínio, integração com PostgreSQL real e fluxos completos de navegador. Cada camada tem um comando próprio para que a suíte adequada possa rodar no desenvolvimento e na CI.

## Testes unitários e de componentes

```bash
npm test
npm run test:watch
```

Os testes `*.test.ts` cobrem regras, casos de uso, mappers, repositórios com Prisma mockado e fronteiras de controllers. Testes `*.test.tsx` podem usar React Testing Library; adicione `// @vitest-environment jsdom` no arquivo quando precisar de DOM.

## Integração com PostgreSQL

```bash
npm run test:integration
```

Configure `TEST_DATABASE_URL` com a URL de uma cópia local do banco, isolada para testes, antes de executar. O runner não cria banco nem aplica migrations. Atualize o schema dessa cópia explicitamente quando necessário. Os testes usam IDs exclusivos e removem somente os registros criados por eles. Use `*.integration.test.ts` para validar transações, constraints, concorrência e SQL real.

## E2E com Playwright

```bash
npm run test:e2e
```

Configure `E2E_DATABASE_URL` com a URL de uma cópia local isolada e `E2E_ALLOW_DATABASE_WRITES=true` para confirmar que os testes vão criar e remover fixtures. O runner não inicia Docker, recria tabelas ou aplica migrations. Ele usa namespace único para os dados, tenta removê-los ao finalizar e inicia o Next.js em `127.0.0.1:3100`. Requer o browser Chromium do Playwright (`npx playwright install chromium`). Não use um banco compartilhado com desenvolvimento, homologação ou produção.

## Regras para novos testes

- Teste invariantes e combinações de domínio de forma unitária, com relógio e dependências controlados.
- Teste autorização, validação e serialização nas fronteiras de actions/controllers, inclusive entrada adulterada e sessão ausente.
- Teste repositórios com mocks para conversões e casos simples; prefira integração PostgreSQL para transações, constraints e concorrência.
- Reserve E2E para caminhos críticos de usuário e segurança que atravessem várias camadas. Mantenha fixtures e credenciais determinísticas.
- Nunca execute seeds ou limpeza destrutiva contra banco compartilhado. Suites com efeitos de banco devem apontar explicitamente para cópias locais isoladas; o cleanup deve remover somente os registros de fixtures próprios.
