# 🌿 Agendamentos — Sistema Integrado de Gestão & Agendamentos

O **Agendamentos** é uma solução completa de gestão operacional e financeira projetada para clínicas de estética, consultórios de saúde e estabelecimentos de serviços com atendimento agendado. 

O sistema unifica em uma única plataforma a **agenda de atendimentos**, o **relacionamento com clientes**, o **controle de caixa e vendas de produtos**, a **gestão da equipe profissional**, o **Portal do Cliente** para autoatendimento e **relatórios de inteligência de negócios (DRE)**.

---

## 📚 Documentação para Agentes e Desenvolvedores

- **[core/ARCHITECTURE.md](./core/ARCHITECTURE.md)**: Camadas, responsabilidades, direção de dependências e convenções para implementação. Leia antes de alterar código.

Toda a documentação técnica, regras de negócio e inventário de funcionalidades está centralizada na pasta [`.agent/`](./.agent/):

- **[.agent/rules.md](./.agent/rules.md)**: Guia e índice central para agentes de IA antes de codificar.
- **[.agent/features.md](./.agent/features.md)**: Inventário completo de funcionalidades e telas do sistema.
- **[.agent/client-portal.md](./.agent/client-portal.md)**: Especificação detalhada do Portal do Cliente (autoatendimento).
- **[.agent/system-rules.md](./.agent/system-rules.md)**: Regras de negócio, políticas de booking e convenções operacionais.
- **[.agent/architecture.md](./.agent/architecture.md)**: Arquitetura Limpa (Clean Architecture), portas, adaptadores e banco de dados.
- **[.agent/use-cases.md](./.agent/use-cases.md)**: Catálogo de casos de uso da camada de aplicação.

---

## 🎯 Visão Geral dos 4 Pilares da Plataforma

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ECOSSISTEMA INTEGRADO                              │
├───────────────────┬───────────────────┬────────────────┬────────────────┤
│ 1. Site           │ 2. Central        │ 3. Portal      │ 4. Painel      │
│    Institucional  │    de Links       │    do Cliente  │    de Gestão   │
│    (/site)        │    (/links)       │    (/cliente)  │    (/dashboard)│
└───────────────────┴───────────────────┴────────────────┴────────────────┘
                                  │
                   BANCO DE DADOS ÚNICO (PostgreSQL)
                  SINCRONIZAÇÃO EM TEMPO REAL (0ms)
```

---

## 🚀 Instalação e Execução Local

### 1. Clonar e Instalar Dependências
```bash
git clone https://github.com/GTavaresDev/agendamentos.git
cd agendamentos
npm install
```

### 2. Banco de Dados e Variáveis de Ambiente
```bash
cp .env.example .env
npx auth secret
docker compose up -d
npx prisma migrate dev
npm run db:seed
```

### 3. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

### Credenciais Padrão de Demonstração:
- **Painel Interno (`/login`)**:
  - Admin: `admin@agendamentos.com` | Senha: `zxcasd`
  - Profissional: `gabriel@agendamentos.com` | Senha: `lkjh-poiu-zxc10`
- **Portal do Cliente (`/cliente`)**:
  - Cadastro em `/cliente/cadastro` ou login direto por e-mail/Google.
