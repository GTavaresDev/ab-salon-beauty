# Arquitetura do Portal Cliente

Este documento define o padrão atual do client. Consulte-o antes de criar,
mover ou remover arquivos.

## Escopo

O client é o portal do cliente final. Ele autentica o cliente, consulta a API
do server e apresenta o fluxo de agendamento.

O server é a fonte de verdade para serviços, profissionais, datas, horários e
agendamentos. O client não consulta o banco para esses dados.

Novos clientes entram somente pelo Google OAuth. O cadastro manual por
formulário não faz parte do portal.

## Estrutura

    client/core/
    ├── domain/
    │   └── auth/
    │       ├── business-rules/
    │       ├── entities/
    │       ├── repositories/
    │       ├── infrastructure/
    │       └── login.factory.ts
    ├── application/
    │   ├── query/
    │   │   ├── common/
    │   │   ├── contract/
    │   │   ├── controller/
    │   │   │   └── login/
    │   │   ├── gateway/
    │   │   └── http/
    │   └── use-cases/
    │       └── login/
    └── ...

## Autenticação — core/domain/auth

auth concentra identidade, perfil, senha, Google OAuth e contratos de
autenticação.

As implementações concretas ficam dentro de domain/auth/infrastructure,
incluindo Prisma, persistência e repositórios do portal. login.factory.ts monta
essas dependências.

Os use cases locais ficam em core/application/use-cases/login e cuidam de
login, OAuth, senha e conclusão do perfil.

Não existe mais domínio local de appointments no client.

## Comunicação com a API — core/application/query

    query/
    ├── common/either.ts
    ├── contract/
    │   ├── appointment.contract.ts
    │   ├── professional.contract.ts
    │   └── service.contract.ts
    ├── controller/
    │   ├── create-appointment.controller.ts
    │   ├── get-date.controller.ts
    │   ├── get-professionals.controller.ts
    │   ├── get-services.controller.ts
    │   ├── read-appointment.controller.ts
    │   ├── update-appointment.controller.ts
    │   └── login/
    ├── gateway/
    │   ├── appointment.gateway.ts
    │   ├── date.gateway.ts
    │   ├── professional.gateway.ts
    │   └── service.gateway.ts
    └── http/action.ts

- contract: tipos de entrada e saída da API.
- gateway: chamadas HTTP e tratamento com Either.
- controller: Server Actions, sessão e validação de entrada.
- common: tipos compartilhados pela comunicação.
- http: contratos de resultados das Server Actions.

clientHttp e os gateways são a única forma de consultar a API. Não crie
consultas Prisma, repositories de agendamento ou regras de disponibilidade no
client.

Cada recurso deve possuir seu próprio arquivo. Não crie uma pasta
query/appointment para agrupar serviços, profissionais ou datas.

## Interface — src

- src/app: páginas, layouts, hooks e componentes específicos das rotas.
- src/components: componentes visuais reutilizáveis.
- src/lib: sessão, cookies e integrações leves.

Componentes e hooks chamam controllers de core/application/query; não importam
repositórios, Prisma ou use cases diretamente.

## Direção das dependências

    src/app e src/components
              ↓
    core/application/query/controller
              ↓
    core/application/query/gateway
              ↓
    API do server

Autenticação segue:

    query/controller/login
              ↓
    domain/auth/login.factory
              ↓
    application/use-cases/login
              ↓
    domain/auth/infrastructure

Regras:

- o client não acessa diretamente o banco para agendamentos;
- o server valida serviço, profissional, data, horário e conflitos;
- controllers não implementam regras de negócio de agendamento;
- gateways não acessam Prisma;
- contratos não executam lógica;
- não crie uma segunda camada presentation;
- mantenha testes próximos ao código testado.

## Nomes

Use kebab-case e nomes que expressem o propósito:

| Tipo | Padrão | Exemplo |
|---|---|---|
| Controller | operação.controller.ts | get-services.controller.ts |
| Gateway | recurso.gateway.ts | professional.gateway.ts |
| Contract | recurso.contract.ts | service.contract.ts |
| Use case | operação.usecase.ts | google-account-link.usecase.ts |
| Entidade | nome.entity.ts | client.entity.ts |
| Repositório | nome.repository.ts | client.repository.ts |
| Componente | nome.component.tsx | appointment-card.component.tsx |
| Hook | use-nome.ts | use-booking-wizard.ts |

Evite nomes genéricos como manager, helper, portal ou service quando o recurso
real puder ser indicado.

## Checklist

- A mudança pertence ao portal cliente?
- É comunicação com o server? Use application/query.
- O arquivo possui o nome do recurso ou da operação?
- O client está evitando acesso direto ao banco?
- A regra pertence ao server ou à autenticação local?
- O controller chama um gateway ou caso de uso adequado?
- Arquivos e pastas legados foram removidos após a movimentação?
