# Permissões por nível no Dashboard-app

Não existe coluna `role` na tabela `Users` e nenhum nível deve ser persistido nela.

O nível de acesso é uma permissão direta, ativa e exclusiva do usuário na tabela
`UserPermissions`. As permissões de nível atualmente reconhecidas são:

- `Product Manegar`
- `Gestor`
- `Usuario`

`Product Manegar` é o nível administrativo que antes era chamado de
`Administrador`; `Usuario` é o nível que antes era chamado de `Funcionario`.
Para compatibilidade de sessão e regras existentes, o backend pode derivar um
papel técnico em memória a partir dessa permissão, mas não deve criar, gravar ou
consultar `Users.role`.

## 1. Matriz de acesso

Legenda:

- Sim = acesso total ao recurso.
- Não = sem acesso.
- Condicional = acesso depende de regra específica (ver seção 2).

| Recurso               | Product Manegar   | Gestor      | Usuario                              |
| --------------------- | ----------------- | ----------- | ------------------------------------ |
| Dashboard             | Sim               | Sim         | Sim (com restrições)                 |
| Agenda                | Sim (vê de todos) | Sim (vê de todos) | Sim (somente próprios atendimentos) |
| Clientes              | Sim               | Sim         | Não                                  |
| Produtos              | Sim               | Sim         | Não                                  |
| Vendas                | Sim               | Sim         | Sim                                  |
| Comissão              | Sim               | Sim         | Não                                  |
| Usuários/Funcionários | Sim               | Sim         | Não                                  |
| Relatórios            | Sim               | Sim         | Condicional                          |
| Configurações         | Sim               | Não         | Não                                  |

## 2. Regras de exceção

### 2.1 Dashboard — Usuario

O Usuario NÃO vê:

- Cards de resumo da dashboard.
- O gráfico/card "Movimento semanal".
- Cards de resumo de Serviços.
- Cards de resumo de Vendas.
- O card "Cadastrar cliente".

### 2.2 Dados de cliente

- E-mail do cliente: retornado somente para Product Manegar. Qualquer outro
  nível não recebe esse campo, nem na tela nem na API.
- Data de nascimento do cliente: Usuario não vê.
- CPF: removido do banco, dos modelos, das telas e das APIs. Não deve ser lido,
  exibido nem gravado.

### 2.3 Portal do cliente (`/cliente`)

- O usuário com a permissão `Product Manegar` NÃO aparece como profissional no
  portal `/cliente`.

### 2.4 Nomenclatura e rotas

- A rota `/usuarios` aparece na sidebar com o nome "Funcionários".

### 2.5 Comissão

- A rota `/comissao` está disponível para Product Manegar e Gestor.
- Usuario é bloqueado nessa rota.

### 2.6 Relatórios para Usuario

- Usuario só acessa relatórios quando também tiver uma permissão direta e ativa
  de relatórios em `UserPermissions`.
- Essa permissão não é um nível e não pode substituir `Usuario`, `Gestor` ou
  `Product Manegar`.

## 3. Regras de implementação

1. Nunca adicionar nem consultar a coluna `Users.role`.
2. Resolver o nível do usuário por sua permissão ativa em `UserPermissions`.
3. Ao criar ou trocar um nível, criar/atualizar a permissão do usuário; não
   criar uma permissão global nem depender de `SystemPermissions`.
4. Toda Server Action, rota e consulta sensível deve validar o nível derivado
   antes de devolver dados.
5. Permissões complementares, como acesso a relatórios, também pertencem ao
   próprio usuário em `UserPermissions`.
6. Senhas de novos usuários — e novas senhas definidas posteriormente — devem
   ter no mínimo 10 caracteres, uma letra maiúscula, um número e um caractere
   especial. Senhas já cadastradas não devem ser alteradas automaticamente.
   No cadastro de usuário, todos os requisitos devem aparecer abaixo do campo
   de senha em vermelho e mudar para verde conforme forem atendidos.

## 4. Checklist rápido para o agente

Antes de implementar ou revisar qualquer tela/API, verificar:

1. O nível em `UserPermissions` tem acesso ao recurso pela matriz?
2. Se o nível é `Usuario`, algum item da seção 2.1 se aplica?
3. O campo sensível (e-mail, data de nascimento, CPF) está sendo retornado a um
   nível que não pode recebê-lo?
4. A agenda está filtrada para "somente próprios atendimentos" quando o nível é
   `Usuario`?
5. A rota `/comissao` está bloqueada para `Usuario`?
6. Uma permissão complementar foi validada diretamente em `UserPermissions`,
   sem depender de `Users.role` ou `SystemPermissions`?
