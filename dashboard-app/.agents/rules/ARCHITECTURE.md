# Arquitetura do Painel Administrativo

Este documento define a organização de agendamentos/frontend. O frontend é
responsável pela operação interna da clínica, não pelo portal do cliente.

## Escopo

O frontend administra clientes, agenda interna, serviços, usuários e
permissões, produtos, vendas, relatórios e configurações operacionais.

O cadastro e login do cliente final, Google do cliente, criação de agendamento
pelo cliente e listagem dos seus agendamentos pertencem a agendamentos/client.

## Domain — core/domain

Contém entidades, regras e contratos independentes de Next.js, React, Prisma,
cookies, cache e e-mail.

Contextos administrativos:

    core/domain/
    ├── appointments/
    ├── clients/
    ├── products/
    ├── reports/
    ├── sales/
    ├── services/
    └── users/

Cada contexto organiza entidades, business-rules, consts, repository e types.
Entidades protegem invariantes, business-rules concentram regras puras e
repository contém apenas interfaces de persistência.

Não coloque Prisma, controllers ou factories no Domain.

## Application — core/application

Coordena casos de uso administrativos e depende de contratos do Domain.

    core/application/
    ├── interfaces/
    └── use-cases/
        ├── appointments/
        ├── clients/
        ├── products/
        ├── reports/
        ├── sales/
        ├── services/
        └── users/

Cada use case representa uma operação específica, como
create-appointment.usecase.ts, list-clients.usecase.ts,
update-service.usecase.ts ou get-dashboard-metrics.usecase.ts.

Use cases orquestram operações, recebem dependências por contratos e não
instanciam repositórios Prisma.

## Presentation — core/presentation

É a camada de entrada do Next.js:

    core/presentation/
    └── controllers/
        ├── appointments/
        ├── clients/
        ├── products/
        ├── reports/
        ├── sales/
        ├── services/
        └── users/

Controllers são a única camada de Presentation. Eles são Server Actions,
validam entrada, obtêm sessão e permissões, chamam use cases e formatam a
saída. Components e hooks importam os controllers diretamente.

Presentation não contém regra de negócio, consultas Prisma ou composição de
implementações concretas.

## Infrastructure — core/infrastructure

Concentra implementações técnicas:

    core/infrastructure/
    ├── auth/
    ├── cache/
    ├── factories/
    ├── persistence/prisma/
    └── shared/

Factories são composition roots e podem instanciar repositórios Prisma e use
cases. Repositórios concretos, mappers, cache, locks, hashing e rate limit
ficam nesta camada.

## Interfaces — core/application/interfaces

É o único diretório de contratos compartilhados da aplicação. Use-o para
contratos HTTP, resultados de operações, DTOs e interfaces externas necessárias
aos casos de uso.

Não crie outro diretório core/interfaces.

## Interface visual — src

- src/app contém rotas, páginas, layouts, hooks e componentes administrativos.
- src/lib contém utilitários de apresentação e integração leve.
- src/components contém componentes visuais reutilizáveis.

Componentes e hooks não importam Prisma ou use cases diretamente. Eles chamam
Controllers da Presentation.

## Direção das dependências

    src/app e src/components
            ↓
    core/presentation
            ↓
    core/application
            ↓
    core/domain

    core/infrastructure implementa contratos internos

Regras:

- Domain não depende de Application, Presentation ou Infrastructure.
- Application não instancia Prisma.
- Presentation não conhece implementações concretas de banco.
- Infrastructure implementa contratos e monta dependências.
- A direção das dependências aponta para dentro.

## Padrão de nomes

Use kebab-case e sufixos explícitos:

| Tipo | Padrão | Exemplo |
|---|---|---|
| Entidade | nome.entity.ts | client.entity.ts |
| Regra | nome.business-rule.ts | permission-validation.business-rule.ts |
| Caso de uso | operação.usecase.ts | create-client.usecase.ts |
| Repositório | nome.repository.ts | client.repository.ts |
| Controller | contexto.controller.ts | client.controller.ts |
| Factory | contexto.factory.ts | client.factory.ts |
| Componente | nome.component.tsx | clients-table.component.tsx |
| Hook | use-nome.ts | use-clients.ts |
| Teste | nome.test.ts | client.entity.test.ts |

Não use portal no frontend: o portal cliente pertence a agendamentos/client.

## Checklist

- A funcionalidade pertence à operação interna da clínica?
- O artefato está no contexto correto?
- O Domain permanece independente de frameworks?
- O use case depende de contratos, não de Prisma?
- O component ou hook chama um controller?
- A factory está em Infrastructure?
- Os testes permanecem próximos do código?
- Os arquivos antigos foram removidos após a movimentação?
