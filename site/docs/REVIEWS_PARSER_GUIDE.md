# 🔄 Google Reviews Parser - Guia de Uso

## 📋 Visão Geral

O sistema tem 3 funções principais para fazer parsing de reviews do Google Maps:

### 1. `parseGoogleReviewHTML(html, authorName?)`
Faz parsing de **uma única review** do HTML.

```typescript
import { parseGoogleReviewHTML } from "@/services/reviews.service";

const singleReviewHTML = `<div>...HTML de uma review...</div>`;
const review = parseGoogleReviewHTML(singleReviewHTML, "João Silva");

// Retorna:
// {
//   author: "João Silva",
//   rating: 5,
//   comment: "Texto da review...",
//   date: "2024-04-14"
// }
```

### 2. `extractAllReviewsFromHTML(html)`
Extrai **múltiplas reviews** de uma página HTML completa.

```typescript
import { extractAllReviewsFromHTML } from "@/services/reviews.service";

const pageHTML = `<div class="reviews-container">...muitas reviews...</div>`;
const reviews = extractAllReviewsFromHTML(pageHTML);

// Retorna array com todas as reviews encontradas
```

### 3. `scrapeGoogleMapsReviewsFromHTML(htmlContent)`
Função completa que **extrai e filtra** as reviews de uma página.

```typescript
import { scrapeGoogleMapsReviewsFromHTML } from "@/services/reviews.service";

const reviews = scrapeGoogleMapsReviewsFromHTML(pageHTML);
// Retorna apenas reviews com rating >= 4 e sem spam
```

---

## 🚀 Como Usar na Prática

### Opção 1: Usar com API Route (Recomendado)

Crie um arquivo `app/api/scrape-reviews/route.ts`:

```typescript
import { scrapeGoogleMapsReviewsFromHTML } from "@/services/reviews.service";

export async function POST(request: Request) {
  try {
    const { htmlContent } = await request.json();

    if (!htmlContent) {
      return Response.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }

    const reviews = scrapeGoogleMapsReviewsFromHTML(htmlContent);
    return Response.json({ reviews, count: reviews.length });
  } catch (error) {
    console.error("Error scraping reviews:", error);
    return Response.json(
      { error: "Failed to scrape reviews" },
      { status: 500 }
    );
  }
}
```

### Opção 2: Usar em Componente Client-Side

```typescript
"use client";

import { useState } from "react";
import { scrapeGoogleMapsReviewsFromHTML } from "@/services/reviews.service";

export default function ReviewsScraper() {
  const [htmlInput, setHtmlInput] = useState("");
  const [reviews, setReviews] = useState([]);

  const handleScrape = () => {
    const extracted = scrapeGoogleMapsReviewsFromHTML(htmlInput);
    setReviews(extracted);
  };

  return (
    <div>
      <textarea
        value={htmlInput}
        onChange={(e) => setHtmlInput(e.target.value)}
        placeholder="Cole o HTML da página do Google Maps aqui..."
        rows={10}
      />
      <button onClick={handleScrape}>Extrair Reviews</button>

      <div>
        {reviews.map((review, i) => (
          <div key={i}>
            <h3>{review.author}</h3>
            <p>⭐ {review.rating}</p>
            <p>{review.comment}</p>
            <small>{review.date}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔍 Estrutura do HTML Esperado

O parser espera por esta estrutura (exatamente como o Google Maps fornece):

```html
<div class="jftiEf fontBodyMedium" aria-label="Nome do Autor" data-review-id="...">
  <div class="GHT2ce">
    <div class="DU9Pgb">
      <!-- Stars: cada <span class="hCCjke google-symbols..."> é uma estrela -->
      <span class="kvMYJc" role="img" aria-label="5 stars">
        <span class="hCCjke google-symbols NhBTye elGi1d"></span>
        <!-- x5 (total de 5 stars) -->
      </span>
      <!-- Date -->
      <span class="rsqaWe">2 years ago</span>
    </div>
    <!-- Review text -->
    <div>
      <span class="wiI7pd">Texto completo da review...</span>
    </div>
  </div>
</div>
```

---

## 📊 Validações Automáticas

O parser filtra reviews que:
- ❌ Têm rating < 4 ⭐
- ❌ Têm menos de 35 caracteres
- ❌ Contêm spam (clique, desconto, whatsapp, link na bio, promo)

---

## 🎯 Fluxo Recomendado

1. **Abra o Google Maps** → Vá para a página da AB Sobrancelhas
2. **Copie o HTML** → F12 → Network → Procure por elementos com `class="jftiEf"`
3. **Cole no parser** → Pode sacar direto com Dev Tools
4. **Processe as reviews** → Use as funções acima

---

## 🔧 Exemplo Completo

```typescript
// 1. Pegar HTML da página
const htmlContent = document.documentElement.innerHTML; // ou fetch de uma URL

// 2. Importar a função
import { scrapeGoogleMapsReviewsFromHTML } from "@/services/reviews.service";

// 3. Processar
const reviews = scrapeGoogleMapsReviewsFromHTML(htmlContent);

// 4. Usar os dados
reviews.forEach((review) => {
  console.log(`${review.author}: "${review.comment}" - ⭐ ${review.rating}`);
});
```

---

## 📦 Exports Disponíveis

```typescript
// src/services/reviews.service.ts

export function parseGoogleReviewHTML(html: string, authorName?: string): Review | null
export function extractAllReviewsFromHTML(html: string): Review[]
export function scrapeGoogleMapsReviewsFromHTML(htmlContent: string): Review[]
export async function getFilteredReviews(limit?: number): Promise<Review[]>
```

---

## ⚠️ Limitações & Notas

- O parser usa **regex**, não é um DOM parser completo
- Funciona melhor com HTML recém-copiado, sem minificação
- Google pode alterar o HTML em qualquer momento
- Para scraping automático, considere usar a **API oficial do Google Places**
