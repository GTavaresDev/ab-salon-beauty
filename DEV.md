# Desenvolvimento com Turbo

Para iniciar o ambiente de desenvolvimento com todas as aplicações rodando em portas fixas, execute:

```bash
npm run dev
```

### Portas dos serviços

| Serviço | Pasta | Porta | Script de desenvolvimento |
|----------|-------|-------|----------------------------|
| cliente‑app | `cliente-app` | **3000** | `PORT=3000 next dev --webpack` |
| dashboard‑app | `dashboard-app` | **3001** | `PORT=3001 next dev --webpack` |
| site | `site` | **3002** | `PORT=3002 next dev` |
| server | `server` | **4000** | `nest start --watch --port 4000` |

Esses scripts já foram atualizados nos respectivos **package.json**. Cada aplicação lê a variável de ambiente `PORT` e inicia o servidor na porta indicada, garantindo que as portas não mudem entre reinícios.

### Observações
- O arquivo `.env.local` na raiz pode conter outras variáveis como `DATABASE_URL`, `AUTH_SECRET`, etc.; ele será compartilhado entre os workspaces.
- Os processos permanecem ativos graças à configuração `"persistent": true` em `turbo.json`.
- Caso precise mudar alguma porta, altere o valor `PORT=` no script `dev` do respectivo `package.json` e reinicie `npm run dev`.

Com isso, todas as portas estão definidas e fixas.
