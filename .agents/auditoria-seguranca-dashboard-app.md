# Auditoria defensiva — dashboard-app

Data: 26/11/2026. Escopo: somente `/Users/gabrieltavares/ab-salon-beauty/dashboard-app`. Método: análise estática; nenhum arquivo do aplicativo foi alterado e nenhum teste ativo foi executado. Senhas e segredos não são reproduzidos neste relatório.

## Resumo executivo

Foram encontrados dois riscos críticos: um Gestor pode enviar `permissionLevel: 0` à Action de criação de usuário, que converte esse valor em `Dono` e persiste a permissão; e scripts de seed versionados contêm senhas fixas. Há riscos altos de integridade financeira: alteração de preço de serviço por qualquer sessão e lançamento de venda/pagamento sem prova de recebimento. As classificações "Seguro" indicam somente proteção visível nos caminhos examinados, não uma garantia sobre produção.

## Checklist

### 1. Rota `/admin`
**Status:** Não aplicável. **Severidade:** nenhuma. **Evidência:** `src/proxy.ts:16-30` enumera as rotas protegidas; não foi encontrada página `/admin` em `src/app`. **Cenário de impacto:** não há rota `/admin` identificada para acessar. **Causa raiz:** funcionalidade ausente neste repositório. **Correção recomendada:** ao criar novas rotas administrativas, exigir sessão e autorização no servidor. **Teste de regressão:** em staging, verificar 404 em `/admin` e bloqueio das rotas administrativas existentes sem sessão.

### 2. Troca de ID na URL / IDOR
**Status:** Inconclusivo. **Severidade:** potencialmente média. **Evidência:** não há página de negócio dinâmica por ID na URL; `core/server/rule/appointment-access.business-rule.ts:6-12` confere acesso a agendamentos, enquanto `core/application/query/controller/sales/sale.controller.ts:51-73` altera uma venda por ID após sessão e senha compartilhada. **Cenário de impacto:** se vendas exigirem propriedade ou autorização individual, trocar o ID pode atingir venda alheia. **Causa raiz:** política de acesso por objeto das vendas não está explícita. **Correção recomendada:** definir e aplicar no servidor a política para leitura, alteração e exclusão por ID. **Teste de regressão:** em staging com contas e registros fictícios, trocar IDs entre usuários e verificar as negativas previstas na política.

### 3. Chaves e segredos no navegador
**Status:** Seguro na análise estática. **Severidade:** baixa. **Evidência:** `src/lib/create-auth-session.ts:43-48` lê `AUTH_SECRET` no servidor; `core/application/query/controller/sales/sale.controller.ts:61-63` lê `SALE_EDIT_PASSWORD` em Server Action; a busca no código não encontrou segredo em `NEXT_PUBLIC_`. **Cenário de impacto:** nenhum vazamento ao navegador foi demonstrado; um bundle ou configuração de implantação pode alterar o resultado. **Causa raiz:** nenhuma identificada neste caminho. **Correção recomendada:** manter segredos fora de props, respostas e logs. **Teste de regressão:** inspecionar bundle de staging apenas com marcadores fictícios e nomes de variáveis, sem imprimir segredos reais.

### 4. Alteração de preço
**Status:** Vulnerável. **Severidade:** alta. **Evidência:** `core/application/query/controller/services/service.controller.ts:36-51` aceita `price` e requer apenas sessão; `core/application/query/controller/products/product.controller.ts:52-66` possui checagem adicional de acesso. O preço de produto de nova venda é lido do banco em `core/server/use-case/sales/create-sale.use-case.ts:37-45`. **Cenário de impacto:** usuário autenticado de menor privilégio pode alterar preço cadastrado de serviço chamando diretamente a Action. **Causa raiz:** falta de autorização por papel na escrita de serviços. **Correção recomendada:** restringir escrita de serviços no servidor e validar valores finitos e faixa aceitável. **Teste de regressão:** conta `Usuario` enviando alteração de preço deve receber recusa e o registro deve permanecer igual.

### 5. Pedido falso
**Status:** Vulnerável no registro interno de venda. **Severidade:** alta. **Evidência:** `core/application/query/controller/sales/sale.controller.ts:30-45` registra venda com sessão; `core/server/use-case/sales/create-sale.use-case.ts:19-49` verifica produto, estoque e quantidade, mas não vincula a venda a pedido ou recebimento confirmado. **Cenário de impacto:** uma conta autenticada pode lançar venda sem compra real e afetar caixa e estoque. **Causa raiz:** lançamento operacional é tratado como venda concluída. **Correção recomendada:** separar rascunho, confirmação e cancelamento, com ator e trilha de auditoria. **Teste de regressão:** lançamento fictício sem confirmação não deve compor receita recebida.

### 6. Pagamento falso
**Status:** Vulnerável. **Severidade:** alta. **Evidência:** `core/application/query/controller/sales/sale.controller.ts:30-45` aceita `paymentMethod` informado pelo chamador; `core/server/use-case/appointments/update-appointment-status.use-case.ts:24-29` exige forma de pagamento para concluir atendimento, sem verificar transação. **Cenário de impacto:** venda ou atendimento pode ser marcado como pago/concluído sem recebimento. **Causa raiz:** método declarado e estado de pagamento não são separados. **Correção recomendada:** criar confirmação de recebimento independente, por conciliação ou procedimento autorizado, com evidência e auditoria. **Teste de regressão:** selecionar Pix fictício sem confirmação deve manter o financeiro pendente.

### 7. Reutilização de cupom
**Status:** Não aplicável. **Severidade:** nenhuma. **Evidência:** `prisma/schema.prisma:210-230` e `core/application/query/controller/sales/sale.controller.ts:30-45` não implementam cupom; busca estática não encontrou fluxo de cupom neste repositório. **Cenário de impacto:** nenhum cupom local pode ser reutilizado. **Causa raiz:** funcionalidade ausente. **Correção recomendada:** caso seja adicionada, impor limite de uso e unicidade em transação. **Teste de regressão:** duas tentativas concorrentes com o mesmo cupom devem produzir apenas um resgate.

### 8. Elevação a admin pelo login
**Status:** Vulnerável por criação de conta privilegiada. **Severidade:** crítica. **Evidência:** `core/application/query/controller/users/user.controller.ts:52-77` recebe `permissionLevel` e, para Gestor, bloqueia somente o nível 1; `core/server/rule/resolve-permission-level.business-rule.ts:20-24` converte nível 0 em `Dono`; `core/server/db/repository/users/prisma-user.repository.ts:83-85` persiste a permissão; `core/server/use-case/users/authenticate-user.use-case.ts:84-91` usa o papel persistido no login. A regra local `.agents/rules/01-read.md` reconhece apenas os níveis Product Manegar, Gestor e Usuario. **Cenário de impacto:** Gestor pode criar credenciais de conta `Dono` e autenticar-se nela. **Causa raiz:** bloqueio de um único valor proibido em vez de lista de níveis permitidos por ator. **Correção recomendada:** validar no servidor uma lista de papéis criáveis por nível, eliminar `Dono` desse fluxo e revisar contas já criadas. **Teste de regressão:** Gestor enviando nível 0 deve receber recusa sem persistência.

### 9. Descoberta ou abuso de OTP
**Status:** Não aplicável neste repositório. **Severidade:** nenhuma. **Evidência:** `core/application/query/controller/users/auth.controller.ts:22-30` recebe e-mail e senha; `core/server/use-case/users/authenticate-user.use-case.ts:33-45` verifica senha. Não foi encontrado fluxo OTP. **Cenário de impacto:** nenhum OTP local pode ser enumerado. **Causa raiz:** funcionalidade ausente. **Correção recomendada:** auditar separadamente outro aplicativo que implemente OTP. **Teste de regressão:** se OTP for introduzido, verificar expiração, uso único, limite de tentativas e respostas sem enumeração de contas.

### 10. Prompt injection
**Status:** Não aplicável. **Severidade:** nenhuma. **Evidência:** `package.json:17-47` e as Actions examinadas não mostram integração de LLM; busca estática não encontrou montagem de prompts. **Cenário de impacto:** nenhuma decisão por IA foi identificada. **Causa raiz:** funcionalidade ausente. **Correção recomendada:** se for adicionada, tratar conteúdo do usuário como dado sem autoridade sobre ferramentas. **Teste de regressão:** conteúdo fictício que peça para ignorar instruções não deve executar ação privilegiada.

### 11. Script no nome de usuário / XSS
**Status:** Seguro na análise estática. **Severidade:** baixa. **Evidência:** `src/app/(agendamentos)/(left-nav-bar)/usuarios/_components/users-table.component.tsx:187` renderiza o nome como texto JSX; busca no repositório não encontrou `dangerouslySetInnerHTML`, `innerHTML` ou `eval` no fluxo. **Cenário de impacto:** marcação no nome deve aparecer literalmente. **Causa raiz:** nenhum sink inseguro identificado. **Correção recomendada:** preservar renderização textual e revisar futuros sinks HTML. **Teste de regressão:** nome fictício contendo `<script>` deve ser exibido como texto, sem execução.

### 12. Upload de arquivo que não é imagem
**Status:** Não aplicável. **Severidade:** nenhuma. **Evidência:** `src/app/layout.tsx:26-41` referencia imagens estáticas; não foi encontrado endpoint de upload ou entrada de arquivo no código de negócio. **Cenário de impacto:** não há upload local para contornar. **Causa raiz:** funcionalidade ausente. **Correção recomendada:** em futura implementação, validar assinatura, tamanho e formato no servidor. **Teste de regressão:** rejeitar arquivo não imagem renomeado com extensão `.png`.

### 13. `.env` ou segredos no Git
**Status:** Vulnerável por credenciais fixas versionadas. **Severidade:** crítica. **Evidência:** `.gitignore:33-35` ignora `.env*` e `git ls-files` mostrou somente `.env.example`; entretanto `prisma/seed.ts:79-103` e `scripts/seed-prod.ts:59-88` definem senhas fixas para contas criadas por esses scripts. **Cenário de impacto:** se uma conta criada por seed permanecer ativa com essa senha, o código versionado revela uma credencial válida. **Causa raiz:** senha embutida em scripts de seed, inclusive script identificado como produção. **Correção recomendada:** remover valores fixos, exigir credencial gerada ou fornecida por canal seguro e trocar senhas das contas afetadas. **Teste de regressão:** varredura de segredos em arquivos rastreados e seed em banco descartável exigindo credencial não fixa.

### 14. Consulta indevida ao banco / SQL injection e RLS
**Status:** Inconclusivo para RLS; SQL injection não identificado nos caminhos examinados. **Severidade:** potencialmente alta. **Evidência:** `core/server/db/repository/users/login-transaction.ts:7` e `core/server/shared/day-lock.ts:18` usam interpolação parametrizada do Prisma; não foram encontradas variantes `Unsafe`. `prisma/schema.prisma:5-8` usa PostgreSQL, mas migrations e `schema.sql` não declararam políticas RLS. **Cenário de impacto:** a ausência de RLS pode ampliar acesso se a credencial de aplicação alcançar o banco fora das Actions; isso depende dos privilégios implantados, que não foram verificados. **Causa raiz:** autorização observada na aplicação; política e privilégios efetivos de banco não confirmados. **Correção recomendada:** manter parametrização, revisar privilégios do usuário de banco e decidir explicitamente sobre RLS. **Teste de regressão:** entrada SQL tratada como dado literal em banco descartável e consulta somente de leitura às políticas/privilégios de staging.

## Priorização

| Prioridade | Itens | Ação |
|---|---|---|
| P0 | 8, 13 | Fechar criação de `Dono`; retirar senhas fixas e trocar credenciais afetadas. |
| P1 | 4, 5, 6 | Autorizar escrita de preços e separar venda lançada de recebimento confirmado. |
| P2 | 2, 3, 11, 14 | Formalizar acesso por ID, verificar bundles e privilégios do banco, manter proteção XSS. |

## Quick wins e plano por etapas

1. **Contenção:** restringir níveis criáveis pelo Gestor, identificar contas `Dono` criadas por esse fluxo e trocar credenciais de contas geradas por seeds.
2. **Integridade operacional:** exigir papel para alterar serviços; modelar estado de pagamento e confirmação de recebimento; registrar ator e transições.
3. **Verificação:** documentar acesso por ID; validar entradas financeiras em tempo de execução; revisar privilégios/RLS e bundles em staging.

## Comandos de validação seguros

Somente leitura: `git status --short`, `git ls-files`, `rg -n 'NEXT_PUBLIC_|dangerouslySetInnerHTML|\$queryRawUnsafe|\$executeRawUnsafe' src core prisma`. Antes de executar `npm test`, confirmar que a configuração escolhida não usa banco real. Testes de autorização, pagamento e SQL devem usar banco local ou staging isolado, dados e contas fictícios, sem gateway real. Inspeção de RLS deve ser somente de leitura. Não executar scripts de seed de produção como parte da validação.

## Riscos residuais

Esta revisão não confirmou configuração de produção, histórico completo de segredos, bundles publicados, privilégios efetivos do banco nem fluxos do portal de cliente fora deste repositório. Nenhum teste ativo foi feito.
