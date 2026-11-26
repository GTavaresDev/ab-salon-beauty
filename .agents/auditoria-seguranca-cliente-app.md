# Auditoria defensiva — cliente-app

Data: 2026-11-26. Escopo: somente `/Users/gabrieltavares/ab-salon-beauty/cliente-app`. Método: análise estática, sem testes ativos, acesso ao banco ou alterações no repositório. Nenhum segredo é reproduzido.

## Resumo executivo

Não foi confirmada vulnerabilidade explorável neste repositório. O portal usa sessão de cliente separada, obtém `clientId` da sessão e não aceita preço nem confirmação de pagamento no agendamento. A principal lacuna é a autorização da API externa de agendamentos: sem seu código ou teste autorizado em local/staging, IDOR e criação ou alteração indevida permanecem inconclusivos. Configuração efetiva de RLS e fluxos administrativos e financeiros de outros apps também estão fora do escopo.

## Checklist

### 1. Rota `/admin`
**STATUS:** Não aplicável. **Severidade:** —. **Evidência:** `src/proxy.ts:20` corresponde somente a `/cliente/:path*`; não há rota `/admin` neste app. **Impacto:** não avaliável aqui. **Causa raiz:** funcionalidade ausente neste repositório. **Correção:** auditar o app administrativo. **Regressão:** usuário anônimo e cliente comum não acessam rota nem ações administrativas naquele app.

### 2. Troca de ID na URL / IDOR
**STATUS:** Inconclusivo. **Severidade:** alta se confirmado. **Evidência:** `src/app/(free-acess)/cliente/painel/meus-agendamentos/[id]/page.tsx:25-31` recebe o ID; `core/application/query/controller/read-appointment.controller.ts:86-101` obtém o cliente da sessão; `core/application/query/gateway/appointment.gateway.ts:76-86,122-129` envia ID e token à API. **Impacto:** se a API não conferir titularidade, um cliente pode ler ou cancelar agendamento alheio. **Causa raiz potencial:** autorização ausente na API, não demonstrada neste repositório. **Correção:** vincular o recurso ao sujeito do token em toda leitura e mutação. **Regressão:** dois clientes fictícios; A recebe 403/404 ao ler, alterar ou cancelar ID de B em local/staging.

### 3. Segredos no navegador
**STATUS:** Seguro no código examinado. **Severidade:** —. **Evidência:** `core/application/query/gateway/appointment.gateway.ts:40-46` lê `CLIENT_AGENDA_SECRET` no servidor; `src/lib/client-session.ts:38-45` configura cookie `httpOnly`; não foi identificado uso de `NEXT_PUBLIC_` para segredo. **Impacto residual:** implantação incorreta pode expor configuração. **Causa raiz:** nenhuma falha observada. **Correção:** preservar credenciais somente no servidor. **Regressão:** examinar build público local por nomes de variáveis sensíveis sem imprimir seus valores.

### 4. Alteração de preço
**STATUS:** Não aplicável ao agendamento; inconclusivo para vendas. **Severidade:** —. **Evidência:** `core/application/query/controller/create-appointment.controller.ts:20-25` não recebe preço; `prisma/schema.prisma:137-149,224-233` contém preço e venda, sem fluxo de venda neste app. **Impacto:** manipulação de valor no serviço de vendas, se existir. **Causa raiz:** não avaliável neste escopo. **Correção:** calcular preço no servidor de vendas a partir do catálogo. **Regressão:** preço enviado pelo cliente não altera valor registrado.

### 5. Pedido falso
**STATUS:** Inconclusivo. **Severidade:** média se confirmado. **Evidência:** `core/application/query/controller/create-appointment.controller.ts:33-76` exige sessão e confere serviço, profissional e horário; `core/application/query/gateway/appointment.gateway.ts:89-100` delega gravação à API. **Impacto:** pedido direto à API poderia contornar validações do portal. **Causa raiz potencial:** API confiar somente na validação do frontend. **Correção:** revalidar identidade, campos e disponibilidade na transação de gravação. **Regressão:** chamadas diretas à API local/staging com dados fictícios inválidos não criam registro.

### 6. Pagamento falso
**STATUS:** Não aplicável. **Severidade:** —. **Evidência:** `core/application/query/contract/appointment.contract.ts:15-20` não inclui confirmação de pagamento; `prisma/schema.prisma:182,233` apenas modela método de pagamento. **Impacto/causa raiz:** não avaliáveis sem fluxo de captura. **Correção:** auditar backend e provedor de pagamentos, se existirem. **Regressão:** confirmação somente por evento autenticado do provedor.

### 7. Reutilização de cupom
**STATUS:** Não aplicável. **Severidade:** —. **Evidência:** `core/application/query/contract/appointment.contract.ts:15-20` não contém cupom; não foi identificado fluxo de cupons. **Impacto/causa raiz:** não demonstráveis. **Correção:** se implementado, resgate único em transação. **Regressão:** duas tentativas concorrentes com cupom fictício resultam em um resgate.

### 8. Elevação a admin pelo login
**STATUS:** Seguro no login do portal examinado. **Severidade:** —. **Evidência:** `core/application/use-cases/login/client-account.usecase.ts:160-183` autentica `Client`; `src/lib/client-session-token.ts:11-20` não contém papel administrativo; `core/application/use-cases/login/google-account-link.usecase.ts:104-109` recusa conta interna sem `Client`. **Impacto residual:** autorização do app administrativo não examinada. **Causa raiz:** nenhuma falha observada no portal. **Correção:** impor papel no backend administrativo. **Regressão:** campos extras como `role` no login não concedem acesso administrativo.

### 9. OTP
**STATUS:** Não aplicável a OTP; inconclusivo para abuso de login. **Severidade:** —. **Evidência:** `core/application/use-cases/login/client-account.usecase.ts:11-15,199-212` usa token aleatório de recuperação com hash e expiração; `core/domain/auth/infrastructure/persistence/prisma/login/prisma-client-password-reset-token.repository.ts:18-25` limita emissão; `core/application/use-cases/login/client-account.usecase.ts:164-180` não mostra limitação de tentativas de senha. **Impacto:** tentativa repetida de senha se inexistir proteção no ponto de entrada/infraestrutura. **Causa raiz:** proteção de login não comprovada neste escopo. **Correção:** confirmar limitação de taxa. **Regressão:** tentativas repetidas com conta fictícia sofrem limitação em local/staging.

### 10. Prompt injection
**STATUS:** Não aplicável. **Severidade:** —. **Evidência:** `src/portal-auth.ts:64` usa `prompt` apenas como parâmetro OAuth do Google; não foi identificado fluxo de modelo de IA. **Impacto/causa raiz:** não demonstráveis. **Correção:** se IA for adicionada, tratar conteúdo do usuário como dado não confiável. **Regressão:** instruções hostis em dados não acionam ferramentas nem alteram regras do sistema.

### 11. Script no nome / XSS
**STATUS:** Seguro nos pontos examinados. **Severidade:** baixa residual. **Evidência:** `src/app/(free-acess)/_components/portal-shell.component.tsx:98-100` renderiza nome como expressão React; `core/application/query/controller/login/login-profile.controller.ts:21-33` aceita nome; não foi encontrado `dangerouslySetInnerHTML`. **Impacto residual:** outro app pode renderizar o mesmo dado de modo inseguro. **Causa raiz:** nenhuma falha observada neste app. **Correção:** manter escape contextual em todos os consumidores. **Regressão:** nome fictício com marcador HTML aparece como texto, sem execução.

### 12. Upload que não é imagem
**STATUS:** Não aplicável. **Severidade:** —. **Evidência:** `core/application/query/contract/appointment.contract.ts:15-20` contém só campos textuais; não foi encontrado endpoint ou componente de upload. **Impacto/causa raiz:** não demonstráveis. **Correção:** se upload for criado, validar conteúdo real, tamanho e destino no servidor. **Regressão:** texto renomeado como imagem é rejeitado.

### 13. `.env` ou segredos no Git
**STATUS:** Seguro para arquivos de ambiente identificados; histórico completo inconclusivo. **Severidade:** baixa residual. **Evidência:** `.gitignore:33-35` ignora `.env*`, exceto `.env.example`; inspeção dos nomes de arquivos rastreados e do histórico disponível encontrou somente arquivos de exemplo, sem expor valores. **Impacto:** eventual segredo embutido em outro arquivo ou histórico remoto pode ser divulgado. **Causa raiz:** não demonstrada. **Correção:** scanner de segredos no CI com saída mascarada. **Regressão:** fixture fictícia é detectada sem imprimir seu valor.

### 14. SQL injection, consulta indevida e RLS
**STATUS:** Inconclusivo para RLS e API; seguro nas consultas SQL identificadas. **Severidade:** alta se autorização ausente. **Evidência:** `core/application/query/controller/read-appointment.controller.ts:47-54` filtra avaliação pelo cliente da sessão; `core/domain/auth/infrastructure/persistence/prisma/login/prisma-client-password-reset-token.repository.ts:10-11,40` usa `$executeRaw` parametrizado; `prisma/schema.prisma:5-8` configura PostgreSQL, mas não comprova RLS efetivo. **Impacto:** consulta sem filtro ou API sem autorização pode expor dados entre clientes. **Causa raiz potencial:** falta de controle de acesso em alguma camada; não confirmada. **Correção:** verificar políticas e privilégios no banco e filtros na API; manter SQL parametrizado. **Regressão:** entradas SQL fictícias são tratadas como dados, e A não lê registros de B em local/staging.

## Priorização

| Prioridade | Trabalho |
|---|---|
| P0 | Nenhum achado confirmado. |
| P1 | Verificar autorização por cliente na API de agendamentos: leitura, criação, atualização e cancelamento (itens 2, 5 e 14). |
| P2 | Confirmar limite de login, RLS/privilégios e scanner de segredos; auditar apps administrativo e financeiro quando autorizados (itens 9, 13 e 14). |

## Quick wins e plano

Documentar o contrato de autorização da API; criar regressões com dois clientes fictícios para todos os métodos por ID; adicionar varredura de segredos ao CI com valores mascarados. Em seguida: confirmar o responsável pela API e banco; executar testes somente em local/staging após aprovação; corrigir falhas confirmadas no serviço correspondente; repetir os testes.

## Comandos seguros de validação estática

```sh
rg --files src/app core/application | rg 'route|controller|gateway|page'
rg -n 'requireClientSession|clientId|queryRaw|executeRaw|dangerouslySetInnerHTML|NEXT_PUBLIC_' src core
git ls-files | rg '(^|/)\.env($|\.)|\.pem$|\.key$'
git status --short
```

## Riscos residuais

Autorização da API externa, políticas efetivas de PostgreSQL, configuração de implantação e fluxos administrativos/financeiros fora deste repositório não foram verificados. Nenhum teste ativo foi executado. Esta auditoria não demonstra exploração nem ausência universal de falhas.
