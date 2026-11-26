# Auditoria defensiva — server

Data: 2026-11-26. Escopo: somente `/Users/gabrieltavares/ab-salon-beauty/server`. Método: análise estática de rotas, serviços, entidades, consultas, testes, arquivos rastreados e nomes de arquivos no histórico Git disponível. Não foram feitos testes ativos nem conexão ao banco. Nenhum segredo é reproduzido.

## Resumo executivo

O principal achado é a emissão de JWT para um `clientId` informado pelo solicitante. Quem possuir o segredo compartilhado aceito por `POST /auth/token` pode obter um token para qualquer cliente ativo com acesso aprovado ao portal. A checagem de titularidade nas rotas de agenda usa o `sub` do JWT, mas não resolve a escolha indevida desse `sub` na emissão.

Também há criação de agendamentos com serviço, duração e profissional fornecidos pelo cliente sem validação contra os registros do servidor. Não foi encontrada operação de preço, pedido comercial ou pagamento nesta API. A configuração efetiva de RLS e o comportamento do navegador não estão neste repositório.

A severidade dos itens inconclusivos indica impacto potencial, não exploração comprovada.

## Checklist

### 1. Rota `/admin`

**STATUS:** Não aplicável. **Severidade:** não atribuída. **Evidência:** `src/app.module.ts:36-38` registra os controladores; `src/app.controller.ts:4-8`, `src/security/token-auth.controller.ts:4-8` e `src/cliente/appointments/appointments.controller.ts:22` definem as rotas `/`, `/auth/token` e `/appointments`. **Impacto:** não há rota `/admin` nesta API; eventual painel de outro app permanece fora do escopo. **Causa raiz:** funcionalidade ausente aqui. **Correção recomendada:** verificar autorização no servidor que hospeda eventual painel. **Teste de regressão:** em staging, usuário comum recebe 403 ou 404 nas rotas administrativas reais.

### 2. Troca de ID na URL / IDOR

**STATUS:** Vulnerável. **Severidade:** alta. **Evidência:** `src/cliente/appointments/appointments.controller.ts:99-101` aplica escopo na consulta por ID; `src/security/token-auth.controller.ts:8-21` aceita `x-client-id` da requisição; `src/security/token-auth.service.ts:18-39` coloca esse ID em `sub` após validar o segredo compartilhado e a elegibilidade do cliente. **Impacto:** um portador desse segredo pode se passar por outro cliente aprovado e acessar ou alterar sua agenda. **Causa raiz:** o segredo autentica o chamador, mas não vincula o chamador ao cliente solicitado. **Correção recomendada:** emitir JWT a partir de sessão individual já autenticada, derivando o ID no servidor. **Teste de regressão:** com credencial de A, solicitar token para B falha; token de A não acessa IDs de B.

### 3. Chaves e segredos no navegador

**STATUS:** Inconclusivo. **Severidade potencial:** crítica. **Evidência:** `src/security/token-auth.controller.ts:10` exige `x-client-agenda-secret`; `src/security/token-auth.service.ts:25-39` lê a chave privada de variável de ambiente no servidor. Não há código de navegador neste escopo. **Impacto:** se o segredo compartilhado chegar ao navegador, qualquer usuário poderá extraí-lo e explorar o item 2. **Causa raiz a confirmar:** local de armazenamento e chamada de `/auth/token` na aplicação cliente. **Correção recomendada:** manter credenciais de serviço somente no servidor e usar autenticação individual. **Teste de regressão:** inspecionar bundle e requisições do navegador com conta fictícia; nenhum segredo de serviço aparece.

### 4. Alteração de preço

**STATUS:** Não aplicável. **Severidade:** não atribuída. **Evidência:** `src/cliente/appointments/entities/appointment.entity.ts:53-101` não contém preço; `src/cliente/appointments/use-cases/getServices.use-case.ts:23-34` não retorna preço. **Impacto:** esta API não calcula nem cobra valores; a aplicação de vendas não pode ser concluída aqui. **Causa raiz:** fluxo ausente neste escopo. **Correção recomendada:** na aplicação que vende, calcular preço pelo catálogo no servidor. **Teste de regressão:** enviar preço adulterado em staging e confirmar que o total persistido vem do servidor.

### 5. Pedido falso

**STATUS:** Vulnerável para agendamento. **Severidade:** alta. **Evidência:** `src/cliente/appointments/appointments.controller.ts:38-45` permite criar agendamento; `src/security/client/client-appointment-transitions.ts:20-26` força titular e status pendente; `src/cliente/appointments/use-cases/createAppointment.use-case.ts:14-23` grava `service`, `duration`, `serviceId` e `userId` recebidos. **Impacto:** cliente autenticado pode criar agendamento pendente com serviço ou duração inventados e indicar outro profissional, sujeito a restrições que o banco eventualmente imponha. **Causa raiz:** não há validação da solicitação contra catálogo, profissional e disponibilidade no momento da gravação. **Correção recomendada:** aceitar apenas IDs necessários, buscar valores autoritativos no servidor e reservar horário atomicamente. **Teste de regressão:** rejeitar serviço inativo ou inexistente, profissional inválido, duração adulterada e horário ocupado; testar concorrência com dados fictícios.

### 6. Pagamento falso

**STATUS:** Não aplicável. **Severidade:** não atribuída. **Evidência:** `src/app.module.ts:38` não registra controlador de pagamento; `src/cliente/appointments/entities/appointment.entity.ts:53-116` não contém estado de pagamento. **Impacto:** pagamentos de outra aplicação não podem ser avaliados aqui. **Causa raiz:** fluxo ausente. **Correção recomendada:** confirmar liquidação pelo provedor no servidor antes de marcar como pago. **Teste de regressão:** retorno de navegador “pago” sem confirmação do provedor não altera o estado.

### 7. Reutilização de cupom

**STATUS:** Não aplicável. **Severidade:** não atribuída. **Evidência:** `src/cliente/appointments/use-cases/createAppointment.use-case.ts:14-23` não recebe ou persiste cupom; `src/app.module.ts:38` lista os controladores. **Impacto:** cupons não são implementados nesta API. **Causa raiz:** fluxo ausente. **Correção recomendada:** onde existirem, registrar resgate único em transação. **Teste de regressão:** duas tentativas simultâneas de uso do mesmo cupom resultam em um único resgate.

### 8. Elevação a admin pelo login

**STATUS:** Inconclusivo. **Severidade potencial:** alta. **Evidência:** esta API não implementa login de funcionários; aceita JWT `staff` assinado e usa `role` do token em `src/security/client/client-agenda.guard.ts:52-79`, concedendo escopo irrestrito a `Administrador` em `src/security/client/client-agenda.guard.ts:23-35`. **Impacto:** erro no emissor externo, chave comprometida ou função revogada ainda presente em token válido pode conceder acesso administrativo; não há evidência de que o login permita escolher a função. **Causa raiz a confirmar:** emissão e revogação dos tokens `staff` fora deste escopo. **Correção recomendada:** auditar o emissor, derivar função de fonte confiável e definir estratégia de revogação. **Teste de regressão:** conta comum não obtém token administrativo mesmo enviando `role=Administrador`; revogação segue a política definida.

### 9. Descoberta ou abuso de OTP

**STATUS:** Não aplicável. **Severidade:** não atribuída. **Evidência:** `src/security/token-auth.controller.ts:8-21` e `src/security/token-auth.service.ts:18-39` implementam segredo compartilhado e JWT; `src/app.module.ts:38` não registra endpoint de OTP. **Impacto:** OTP de outra aplicação não pode ser avaliado. **Causa raiz:** fluxo ausente. **Correção recomendada:** onde existir, aplicar expiração, uso único e limite de tentativas. **Teste de regressão:** código expirado, reutilizado ou após tentativas excessivas falha.

### 10. Prompt injection

**STATUS:** Não aplicável. **Severidade:** não atribuída. **Evidência:** `src/app.module.ts:14-44` registra autenticação, banco e agenda, sem fluxo de modelo ou agente. **Impacto:** não há entrada enviada a LLM nesta API. **Causa raiz:** fluxo ausente. **Correção recomendada:** se for introduzido, tratar conteúdo de usuários como dado sem autoridade sobre instruções ou ferramentas. **Teste de regressão:** entrada hostil fictícia não altera instruções nem aciona operações privilegiadas.

### 11. Script no nome de usuário / XSS

**STATUS:** Inconclusivo. **Severidade potencial:** média. **Evidência:** `src/cliente/appointments/dto/create-appointment.dto.ts:1-15` recebe `name` sem validação declarada; `src/cliente/appointments/use-cases/createAppointment.use-case.ts:16-23` persiste o nome; `src/cliente/appointments/use-cases/getAppointmentsById.use-case.ts:18-28` pode retorná-lo. **Impacto:** XSS armazenado é possível se algum consumidor inserir o texto como HTML executável; não há renderizador aqui para comprová-lo. **Causa raiz a confirmar:** tratamento de saída na interface. **Correção recomendada:** validar limites e formato do nome; renderizar como texto escapado em todos os clientes. **Teste de regressão:** nome fictício com marcação HTML aparece como texto, sem execução.

### 12. Upload de arquivo que não é imagem

**STATUS:** Não aplicável. **Severidade:** não atribuída. **Evidência:** `src/cliente/appointments/appointments.controller.ts:22-125` não inclui upload; `src/app.ts:22` configura parser JSON. **Impacto:** não há fluxo de arquivo nesta API. **Causa raiz:** fluxo ausente. **Correção recomendada:** no serviço de imagens, validar assinatura, decodificar e reprocessar a imagem, além de limitar tamanho. **Teste de regressão:** arquivo de texto renomeado `.jpg` é rejeitado em staging.

### 13. `.env` ou segredos no Git

**STATUS:** Seguro no escopo verificado. **Severidade:** baixa. **Evidência:** `.gitignore:41-46` ignora arquivos locais de ambiente. Inspeção dos arquivos rastreados e dos nomes de arquivos no histórico disponível deste diretório não encontrou `.env`, `.pem` ou `.key`; busca por padrões usuais de chaves privadas, tokens e URL de banco apontou apenas para exemplo de comando de teste em `test/spec.md:78-82`. Nenhum valor de segredo foi exibido. **Impacto:** uma credencial real no Git exigiria rotação e limpeza do histórico; não foi encontrada evidência disso aqui. **Causa residual:** padrões de busca não detectam todo formato possível, e o histórico local pode ser incompleto. **Correção recomendada:** manter ambiente fora do Git e usar scanner de segredos no CI. **Teste de regressão:** CI detecta credencial fictícia adicionada a commit de ensaio sem imprimir seu valor.

### 14. Consulta indevida ao banco / SQL injection e RLS

**STATUS:** Inconclusivo. **Severidade potencial:** alta. **Evidência:** consultas com entradas de usuário usam parâmetros em `src/security/client/portal-access.ts:3-8`, `src/cliente/appointments/use-cases/getDate.use-case.ts:23-45` e `src/cliente/appointments/appointments.controller.ts:55-58`; há teste de SQL injection para acesso ao portal em `test/portal-sql-injection.e2e-spec.ts:27-47`. O servidor acessa Postgres por `DATABASE_URL` em `src/app.module.ts:21-34`. **Impacto:** não foi identificada SQL injection nesses caminhos, mas privilégios excessivos da credencial ou ausência de políticas no banco podem ampliar o efeito de falha na API. **Causa raiz a confirmar:** grants e políticas RLS não estão definidos neste repositório. **Correção recomendada:** revisar privilégios da role da aplicação e, se RLS fizer parte do modelo, verificar políticas e `FORCE ROW LEVEL SECURITY` conforme o caso. **Teste de regressão:** em banco local isolado, consultar como role da aplicação e verificar que leituras e escritas fora do escopo são negadas.

## Priorização

| Prioridade | Trabalho | Motivo |
| --- | --- | --- |
| P0 | Verificar se `x-client-agenda-secret` chega ao navegador ou a terceiros; se sim, substituir o fluxo e rotacionar o segredo | Nesse cenário, o item 2 permite impersonar clientes aprovados |
| P1 | Vincular emissão do JWT a uma identidade individual autenticada | Corrige a escolha arbitrária do `sub` |
| P1 | Validar serviço, duração, profissional e vaga no servidor | Impede agendamentos fictícios ou inconsistentes |
| P1 | Auditar emissor `staff` e privilégios da role do banco | Fecha pontos de confiança não comprovados neste repositório |
| P2 | Validar campos de texto, verificar renderização contra XSS e adicionar varredura de segredos no CI | Reduz riscos dependentes de outras camadas |

## Quick wins

- Acrescentar teste que tente emitir token de B usando credencial de A.
- Rejeitar `serviceId` inexistente ou inativo.
- Ignorar `duration` e `userId` fornecidos pelo cliente até buscá-los no banco.
- Confirmar que o segredo compartilhado não aparece no bundle nem nas requisições do navegador.

## Plano de correção por etapas

1. Mapear quem chama `/auth/token` e conter eventual exposição do segredo.
2. Corrigir a emissão e cobrir isolamento entre clientes.
3. Tornar a criação de agendamento baseada em dados autoritativos e reserva atômica.
4. Auditar emissor `staff`, permissões e RLS, além da renderização na interface.
5. Executar regressões em ambiente isolado e revisar riscos restantes.

## Comandos de validação seguros

Inspeção estática: `git status --short`, `git ls-files`, `rg` sobre `src/` e `test/`. Validação local sem banco: `npm run lint` e testes unitários com mocks, por exemplo `npm run test -- src/security/client/client-agenda.guard.spec.ts`.

Os testes e2e existentes fazem `INSERT` e `DELETE`; antes de executá-los, confirmar `TEST_DATABASE_URL` de um banco local isolado, com dados fictícios, e revisar cada teste. Não apontá-los para produção. Nenhum teste ativo foi executado nesta auditoria.

## Riscos residuais

Interface e bundle do navegador, emissão de login `staff`, pagamentos, cupons, OTP, uploads, configuração efetiva de RLS/grants e histórico Git remoto não foram auditados neste escopo. A ausência dessas funções aqui não equivale a segurança nelas.
