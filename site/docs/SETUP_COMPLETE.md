# 🎯 Setup Completo - Google Reviews Scraper & Parser

## ✅ O que foi implementado

Criei um sistema completo para fazer scraping e parsing de reviews do Google Maps. Aqui estão os arquivos principais:

### 📁 Arquivos Criados:

#### 1. **Core Functions** (`src/services/reviews.service.ts`)
- ✅ `parseGoogleReviewHTML()` - Parse de uma review
- ✅ `extractAllReviewsFromHTML()` - Extrai múltiplas reviews
- ✅ `scrapeGoogleMapsReviewsFromHTML()` - Scraping + Filtragem completa

#### 2. **API Route** (`app/api/reviews/scrape/route.ts`)
- POST endpoint em `/api/reviews/scrape`
- Aceita HTML via JSON
- Retorna reviews processadas

#### 3. **React Component** (`src/components/ReviewsScraper.tsx`)
- Componente interativo para colar HTML
- UI com resumo de dados
- Lista formatada de reviews

#### 4. **Custom Hook** (`src/hooks/useReviewsScraper.ts`)
- `useReviewsScraper()` - Hook para chamar a API
- Gerencia loading, error, e resultados
- Callbacks onSuccess/onError

#### 5. **Documentação** 
- `REVIEWS_PARSER_GUIDE.md` - Guia completo de uso
- Exemplos de integração
- Estrutura de HTML esperada

---

## 🚀 Como Usar - 3 Opções

### Opção 1: Componente (Mais Fácil)
Importe o componente na sua página:

```tsx
import ReviewsScraper from "@/components/ReviewsScraper";

export default function Page() {
  return <ReviewsScraper />;
}
```

A UI permite:
- Colar HTML
- Ver resumo (total, rating médio, etc)
- Lista formatada das reviews

---

### Opção 2: Hook com API

```tsx
"use client";

import { useReviewsScraper } from "@/hooks/useReviewsScraper";

export default function MyComponent() {
  const { scrape, reviews, loading, error } = useReviewsScraper();

  const handleClick = async () => {
    const htmlCode = document.querySelector(".reviews-section")?.innerHTML;
    await scrape(htmlCode);
  };

  return (
    <div>
      <button onClick={handleClick}>Scrape</button>
      {reviews.map(r => <div key={r.author}>{r.comment}</div>)}
    </div>
  );
}
```

---

### Opção 3: Direto em Servidor

```typescript
import { scrapeGoogleMapsReviewsFromHTML } from "@/services/reviews.service";

// Em um Server Component ou Route Handler
const htmlContent = await fetchFromGoogle(); // ou pass from client
const reviews = scrapeGoogleMapsReviewsFromHTML(htmlContent);
```

---

## 📊 Teste Rápido

Verificar se tudo está funcionando:

```bash
npm run dev
# Open http://localhost:3000/api/reviews/scrape
# POST com:
# {
#   "htmlContent": "<div class=\"jftiEf\"...>"
# }
```

---

## 🎨 Integração na Sua Página

Se você quer exibir reviews em uma página, basta integrar o componente:

```tsx
// app/reviews.tsx
import ReviewsScraper from "@/components/ReviewsScraper";

export default function ReviewsPage() {
  return (
    <div className="container mt-10">
      <h1>Gerenciar Reviews</h1>
      <ReviewsScraper />
    </div>
  );
}
```

---

## 🔄 Fluxo End-to-End

```
1. Você abre Google Maps
   ↓
2. F12 → Inspector → Copy HTML da seção de reviews
   ↓
3. Cola no componente/textarea
   ↓
4. Clica "Scrape"/"Extrair"
   ↓
5. Sistema faz parsing:
   - Extrai author, rating, comment, date
   - Filtra spam (rating < 4, muito curto, etc)
   - Ordena por keywords relevantes
   ↓
6. Exibe na página formatado
```

---

## 📝 Estrutura de Dados

```typescript
type Review = {
  author: string;      // Nome do usuário
  rating: number;      // 1-5 stars
  comment: string;     // Texto da review
  date: string;        // YYYY-MM-DD format
};
```

---

## ⚙️ Validações Automáticas

Reviews são filtradas se:
- ❌ Rating < 4 ⭐
- ❌ Menos de 35 caracteres
- ❌ Contém: "clique", "desconto", "whatsapp", "link", "promo"
- ❌ Parece ser spam

---

## 🧪 Testes Disponíveis

Há 2 arquivos de teste criados:

```bash
# Teste single review
node test-parser.js

# Teste múltiplas reviews
node test-scraper.js
```

---

## 💡 Próximos Passos Opcionais

1. **Integrar com Banco de Dados**
   - Salvar reviews processadas
   - Tracking de mudanças ao longo do tempo

2. **Scraping Automático**
   - Usar Puppeteer/Playwright
   - Fetch automático a cada dia

3. **Analytics Dashboard**
   - Gráficos de rating
   - Tendências ao longo do tempo
   - Palavras-chave mais mencionadas

4. **Notificações**
   - Alert quando nova review 5⭐
   - Notificação de reviews baixas

---

## 🤝 Support

Todas as funções estão em:
- **Core**: `src/services/reviews.service.ts`
- **API**: `app/api/reviews/scrape/route.ts`
- **Frontend**: `src/components/ReviewsScraper.tsx`

Para dúvidas, veja `REVIEWS_PARSER_GUIDE.md`
