# Especificação dos testes de segurança de agendamentos

## Objetivo

Validar, através de testes e2e com NestJS, Jest/Vitest e Supertest, que a API de agendamentos:

- exige autenticação JWT válida;
- associa a requisição ao cliente identificado pelo campo `sub` do token;
- impede que um cliente consulte, altere ou remova agendamentos de outro cliente;
- não permite que o `clientId` enviado pelo cliente sobrescreva a identidade autenticada;
- não revela a existência de agendamentos fora do escopo autorizado.

## Contrato de autenticação

As rotas são protegidas pelo `ClientAgendaGuard`, registrado globalmente em `AppModule`.

O token precisa:

- usar o esquema `Bearer`;
- ser um JWT com algoritmo `RS256`;
- ter `iss: "client"`;
- ter `aud: "client-agenda-api"`;
- conter `sub` string;
- conter `iat` e `exp` válidos;
- ter validade máxima de 20 minutos;
- ser assinado pela chave privada correspondente a uma chave pública cadastrada em `CLIENT_AGENDA_CLIENT_PUBLIC_KEYS`.

Para clientes, o valor de `sub` é usado como `clientId` no escopo da consulta. A aplicação não usa `JwtService` nem segredo HMAC para esse fluxo; a assinatura é RSA.

## Rotas relevantes

| Operação | Rota | Regra de autorização |
| --- | --- | --- |
| Criar | `POST /appointments` | O `clientId` é sempre o cliente do token. |
| Listar | `GET /appointments/client/:clientId` | O cliente só pode listar os próprios agendamentos. |
| Consultar | `GET /appointments/:id` | Agendamento de outro cliente retorna `404`. |
| Alterar | `PATCH /appointments/:id` | Agendamento de outro cliente retorna `403`. |
| Remover | `DELETE /appointments/:id` | Agendamento de outro cliente retorna `403`. |

IDs inexistentes retornam `404` e não devem permitir inferir se o registro existe.

## Cenários cobertos

O arquivo `test/agendamentos.security.e2e-spec.ts` cobre os seguintes cenários:

### Autenticação JWT

- requisição sem token retorna `401`;
- token assinado por outra chave retorna `401`;
- token expirado retorna `401`;
- token malformado retorna `401`;
- token válido de cliente existente permite acesso.

### Isolamento entre clientes

- listagem retorna somente os agendamentos do cliente autenticado;
- consulta por ID de agendamento de outro cliente retorna `404`;
- tentativa de alteração de agendamento alheio retorna `403`;
- o registro não é alterado após tentativa de alteração indevida;
- tentativa de remoção de agendamento alheio retorna `403`;
- o registro continua existindo após tentativa de remoção indevida;
- `clientId` de outro cliente enviado no `POST` é ignorado;
- o agendamento criado recebe o cliente representado pelo token;
- GET, PATCH e DELETE com ID inexistente retornam `404`.

## Isolamento do banco

Os testes exigem a variável `TEST_DATABASE_URL` e substituem `DATABASE_URL` antes de inicializar o `AppModule`. Assim, não devem ser executados apontando para o banco de produção ou desenvolvimento.

No `beforeAll`, são criados:

- dois clientes temporários, A e B;
- um agendamento pertencente a A;
- um agendamento pertencente a B.

No `afterAll`, os registros criados pelos testes são removidos.

## Execução

```bash
TEST_DATABASE_URL="postgresql://usuario:senha@localhost:5432/agendamentos_test" \
npm run test:e2e -- test/agendamentos.security.e2e-spec.ts
```

O teste usa a chave RSA configurada na aplicação quando `CLIENT_AGENDA_JWT_PRIVATE_KEY` está disponível. Caso contrário, gera um par de chaves temporário em memória e injeta a chave pública somente no processo de teste.
