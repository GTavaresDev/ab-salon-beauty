# Checklist de auditoria defensiva do Ab Salon Beauty

Revisão estática do commit `9fee7a5`, abrangendo `dashboard-app`, `cliente-app`, `server` e `site`. Os resultados valem para os fluxos examinados no checkout. Testes, configurações de produção e estado do banco ficaram fora da validação.

## 1. Acesso administrativo

Compare a matriz de níveis com as verificações em páginas, handlers e Server Actions. **Seguro** para o início da impersonação examinada, que exige administrador e alvo ativo. **Vulnerável** na edição e exclusão de vendas, que usam senha compartilhada sem permissão individual. **Inconclusivo** na gestão de serviços, pois a matriz não explicita quais níveis podem alterá-los.

Evidência em `dashboard-app/core/application/query/controller/users/auth.controller.ts:112` e `dashboard-app/core/application/query/controller/sales/sale.controller.ts:51`.

## 2. IDOR e titularidade

Verifique se cada ID recebido está vinculado ao cliente, profissional ou clínica autorizada. **Seguro** nas consultas, no cancelamento, no reagendamento e nas avaliações examinadas do portal. **Vulnerável** nas mutações de vendas quando o ator autenticado conhece a senha compartilhada.

Evidência em `server/src/cliente/appointments/appointments.controller.ts:54` e `dashboard-app/core/application/query/controller/sales/sale.controller.ts:51`.

## 3. Segredos e dados no navegador

Inspecione respostas, sessões, builds, propriedades serializadas e variáveis públicas. **Vulnerável** porque a fila de aprovação entrega e-mails a `Gestor` e a agenda pode entregar `commissionPercent` a `Usuario`. A revisão não identificou data de nascimento entregue a `Usuario` ou uso ativo de CPF nos fontes examinados. Os bundles publicados ficaram **inconclusivos**.

Evidência em `dashboard-app/core/application/query/controller/clients/portal-approval.controller.ts:8` e `dashboard-app/core/server/db/repository/appointments/appointment.mapper.ts:38`.

## 4. Integridade de preços

Rastreie preços, descontos, totais e comissões até a persistência. **Seguro** na criação de vendas examinada, que usa o preço do produto e revalida preço e estoque na transação. **Vulnerável** na edição, que aceita preço unitário informado sob o controle compartilhado. A conclusão do atendimento deriva a comissão do cadastro ou preserva o percentual histórico.

Evidência em `dashboard-app/core/server/use-case/sales/create-sale.use-case.ts:20` e `dashboard-app/core/server/use-case/sales/update-sale.use-case.ts:24`.

## 5. Criação de vendas, pedidos e reservas

Verifique identidade, catálogo, horário, estado inicial e proteção contra concorrência. **Seguro** no fluxo principal do portal, que vincula a reserva ao cliente, exclui `Product Manegar` do catálogo elegível e verifica disponibilidade sob bloqueio transacional. **Inconclusivo** para o ramo de equipe do NestJS, que usa outra gravação e cuja habilitação no ambiente não foi confirmada.

Evidência em `server/src/cliente/appointments/use-cases/createAppointment.use-case.ts:15` e `server/src/cliente/appointments/use-cases/booking-availability.ts:72`.

## 6. Integridade financeira

Identifique quem pode registrar ou alterar valores, métodos e estados financeiros. **Vulnerável** na edição manual de vendas, pelo controle compartilhado. A agenda registra método de pagamento na conclusão. Gateway e webhook ficaram **não aplicáveis** no escopo pesquisado.

Evidência em `dashboard-app/core/application/query/controller/sales/sale.controller.ts:51` e `dashboard-app/core/application/query/controller/appointments/appointment.controller.ts:59`.

## 7. Cupons e benefícios limitados

Confira elegibilidade, expiração, limites de uso e resgates concorrentes. **Não aplicável** ao resgate no código pesquisado. O site divulga desconto de primeira experiência e encaminha ao WhatsApp. A revisão não identificou cupom persistido ou contador de uso.

Evidência em `site/src/components/FirstExperienceDiscount.tsx:15`.

## 8. Elevação de privilégio e sessões

Revise login, OAuth, impersonação, derivação de nível e revogação. **Seguro** para a revalidação de permissões nas actions examinadas do painel. O mapper mantém aliases e resolve níveis simultâneos por precedência. Relatórios ignoram a permissão complementar de `Usuario`, bloqueando acesso legítimo. A revogação de tokens de equipe do NestJS ficou **inconclusiva**, pois o guard usa o papel assinado até expirar e o emissor ativo não foi confirmado.

Evidência em `dashboard-app/core/application/query/controller/users/auth.controller.ts:79`, `dashboard-app/src/lib/permissions.ts:21` e `server/src/security/client/client-agenda.guard.ts:54`.

## 9. OTP e recuperação

Verifique vínculo com a conta, expiração, uso único, limitação de tentativas e exposição. OTP ficou **não aplicável** nos pontos pesquisados. A confirmação de identidade na recuperação via WhatsApp é **inconclusiva**. Existe implementação de token com hash, expiração e consumo transacional, sem entrada ativa confirmada.

Evidência em `cliente-app/src/app/(free-acess)/_components/password-reset-form.component.tsx:13` e `cliente-app/core/domain/auth/infrastructure/persistence/prisma/login/prisma-client-password-reset-token.repository.ts:29`.

## 10. Prompt injection

Identifique se conteúdo não confiável chega a modelos de linguagem com acesso a dados ou ações. **Não aplicável** no escopo pesquisado. O serviço de avaliações usa extração e filtragem em código.

Evidência em `site/src/services/reviews.service.ts:369`.

## 11. XSS

Rastreie nomes, avaliações e campos livres até texto, HTML, atributos, URLs e metadados. **Seguro** nos pontos inspecionados. Os componentes usam interpolação textual do React e os usos encontrados de HTML explícito serializam metadados estruturados sem entrada de usuários identificada.

Evidência em `dashboard-app/src/app/(agendamentos)/(left-nav-bar)/agenda/_components/agenda-view.component.tsx:375` e `site/app/page.tsx:91`.

## 12. Uploads

Verifique tipo real, tamanho, armazenamento e autorização de arquivos. **Não aplicável** no código pesquisado. A rota pública de avaliações recebe HTML como string JSON e possui risco de consumo de recursos se publicada sem limite efetivo de entrada.

Evidência em `site/app/api/reviews/scrape/route.ts:20`.

## 13. Segredos no Git

Revise arquivos rastreados, exclusões e histórico sem reproduzir valores. **Vulnerável** pelo registro de senha literal de desenvolvimento desde `aecf465`. Sua validade e eventual reutilização fora do ambiente local ficaram **inconclusivas**.

Evidência em `server/test/spec.md:81`.

## 14. Banco, SQL injection e RLS

Confira parametrização, escopo, roles, grants e políticas. **Seguro** nas consultas raw examinadas quanto à parametrização. **Inconclusivo** quanto a RLS e privilégios efetivos. O NestJS ainda consulta `Users.role` no escopo de `Gestor`, embora a migração do painel remova a coluna. Consultas desse ramo podem falhar se os componentes usarem a mesma base migrada.

Evidência em `server/src/security/client/client-agenda.guard.ts:23`, `dashboard-app/prisma/migrations/20261126020000_move_user_level_to_user_permissions/migration.sql:19` e `cliente-app/prisma/schema.prisma:10`.
