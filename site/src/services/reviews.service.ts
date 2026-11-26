import type { Review } from "@/types/review.type";

const KEYWORDS = ["sobrancelha", "atendimento", "resultado", "profissional"];
const MIN_REVIEW_LENGTH = 35;
const MIN_RATING = 4;
const DEFAULT_SEARCH_URL =
  "https://www.google.com/search?q=ab+sobrancelhas+goiania&sourceid=chrome&ie=UTF-8";

/**
 * Extract all reviews from complete Google Maps reviews HTML page
 * @param html - Full HTML page containing multiple reviews
 * @returns Array of Review objects
 */
export function extractAllReviewsFromHTML(html: string): Review[] {
  const reviews: Review[] = [];

  try {
    // Split by review containers - each review is wrapped in aria-label with author name
    const reviewContainerRegex =
      /<div class="jftiEf fontBodyMedium "\s+aria-label="([^"]+)"\s+data-review-id="[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g;

    let match;
    while ((match = reviewContainerRegex.exec(html)) !== null) {
      const authorName = match[1];
      const reviewBlockHtml = match[0];

      const review = parseGoogleReviewHTML(reviewBlockHtml, authorName);
      if (review) {
        reviews.push(review);
      }
    }
  } catch (error) {
    console.error("Error extracting reviews from HTML:", error);
  }

  return reviews;
}

/**
 * Parse Google Reviews HTML and extract review data
 * @param html - HTML string containing a single review element
 * @param authorName - Optional author name (extracted from button if not provided)
 * @returns Review object or null if parsing fails
 */
export function parseGoogleReviewHTML(
  html: string,
  authorName?: string
): Review | null {
  try {
    // Extract rating (count the star spans)
    const starRegex = /<span class="hCCjke google-symbols NhBTye elGi1d"/g;
    const starMatches = html.match(starRegex);
    const rating = starMatches ? starMatches.length : 0;

    if (rating < MIN_RATING) {
      return null;
    }

    // Extract date
    const dateRegex = /<span class="rsqaWe">([^<]+)<\/span>/;
    const dateMatch = html.match(dateRegex);
    const relativeDate = dateMatch ? dateMatch[1] : "";

    // Extract comment - handle both truncated and full text
    // First try to get full comment from MyEned div
    const fullCommentRegex =
      /<span class="wiI7pd">([^<]+)(?:<\/span>\s*<span>|<\/span>)/;
    const commentMatch = html.match(fullCommentRegex);
    const comment = commentMatch ? commentMatch[1].trim() : "";

    // Check minimum length
    if (comment.length < MIN_REVIEW_LENGTH) {
      return null;
    }

    // Extract author from aria-label if not provided
    let author = authorName || "Unknown";
    if (!authorName) {
      const authorRegex = /aria-label="([^"]+)"\s+data-review-id/;
      const authorMatch = html.match(authorRegex);
      if (authorMatch) {
        author = authorMatch[1];
      }
    }

    // Convert relative date to ISO format
    const date = convertRelativeDateToISO(relativeDate);

    return {
      author,
      rating,
      comment,
      date,
    };
  } catch (error) {
    console.error("Error parsing review HTML:", error);
    return null;
  }
}

/**
 * Convert relative date strings (e.g., "2 years ago") to ISO date format
 */
function convertRelativeDateToISO(relativeDate: string): string {
  const now = new Date();
  const dateString = relativeDate.toLowerCase().trim();

  const numberMatch = dateString.match(/(\d+)/);
  if (!numberMatch) {
    return now.toISOString().split("T")[0];
  }

  const amount = parseInt(numberMatch[1], 10);
  let date = new Date(now);

  if (dateString.includes("year")) {
    date.setFullYear(date.getFullYear() - amount);
  } else if (dateString.includes("month")) {
    date.setMonth(date.getMonth() - amount);
  } else if (dateString.includes("week")) {
    date.setDate(date.getDate() - amount * 7);
  } else if (dateString.includes("day")) {
    date.setDate(date.getDate() - amount);
  } else if (dateString.includes("hour")) {
    date.setHours(date.getHours() - amount);
  }

  return date.toISOString().split("T")[0];
}

const MOCK_REVIEWS: Review[] = [
  {
    author: "Vitoria Naciff Lima",
    rating: 5,
    comment:
      "Encantada com o atendimento! Além de me encaixar em um horario que eu podia com urgencia, me atendeu com muita atencao e educacao. Ambiente sem palavras para a beleza desse lugar. Me surpreendeu por completo o trabalho tao bem feito.",
    date: "2025-04-14",
  },
  {
    author: "Beatriz Xoimbra",
    rating: 5,
    comment:
      "O atelie mais lindo e aconchegante! As meninas sao super atenciosas e buscam valorizar as sobrancelhas naturais, fazendo com que as minhas ficassem mais lindas ao longo dos anos.",
    date: "2024-04-14",
  },
  {
    author: "Larissa Araujo",
    rating: 5,
    comment:
      "A melhor sem duvidas. Se voce quer sobrancelhas perfeitas, o lugar e aqui! Super indico pelas melhores profissionais e pelo melhor atendimento.",
    date: "2022-04-14",
  },
  {
    author: "Isadora Gabrielly Campos",
    rating: 5,
    comment:
      "Atendimento impecavel! Indico para todas as minhas amigas. Melhor lugar para fazer as sobrancelhas e cilios.",
    date: "2024-04-14",
  },
  {
    author: "Jonatas Pain de Deus",
    rating: 5,
    comment:
      "Faco minha sobrancelha la tem anos. Excelente profissional e atendimento.",
    date: "2024-04-14",
  },
  {
    author: "Alvaro Franzao",
    rating: 5,
    comment:
      "Atendimento impecavel! Fiz minha limpeza de pele com a profissional Ariely e adorei.",
    date: "2024-04-14",
  },
  {
    author: "Kellyany Pereira Silva",
    rating: 5,
    comment:
      "Faco atendimentos com elas ha mais de 5 anos. Amo o trabalho delas e o cuidado super detalhista!",
    date: "2024-04-14",
  },
  {
    author: "Isabela Ricioli",
    rating: 5,
    comment:
      "Amo esse lugar, profissionais maravilhosas.",
    date: "2024-04-14",
  },
  {
    author: "Edna M",
    rating: 5,
    comment:
      "Excelentes profissionais em um ambiente aconchegante.",
    date: "2024-04-14",
  },
  {
    author: "Hannaria Stefani Marques Teixeira",
    rating: 5,
    comment:
      "Atendimento e servicos maravilhosos, super recomendo!",
    date: "2024-04-14",
  },
  {
    author: "Rafaela Granzotti",
    rating: 5,
    comment:
      "Otimo atendimento e profissionais excelentes.",
    date: "2024-04-14",
  },
  {
    author: "Ana Carolina",
    rating: 5,
    comment:
      "Excelente profissional.",
    date: "2024-04-14",
  },
  {
    author: "Lia Braz",
    rating: 5,
    comment:
      "Excelente profissional.",
    date: "2024-04-14",
  },
];

function hasSpamSignals(comment: string): boolean {
  const text = comment.toLowerCase();
  return /(clique|desconto|whatsapp|link na bio|promo)/.test(text);
}

function keywordScore(comment: string): number {
  const text = comment.toLowerCase();
  return KEYWORDS.reduce((score, word) => (text.includes(word) ? score + 1 : score), 0);
}

function sanitizeAndFilterReviews(reviews: Review[]): Review[] {
  return reviews
    .filter((review) => review.rating >= MIN_RATING)
    .filter((review) => review.comment.trim().length >= MIN_REVIEW_LENGTH)
    .filter((review) => !hasSpamSignals(review.comment))
    .sort((a, b) => {
      const keywordDelta = keywordScore(b.comment) - keywordScore(a.comment);
      if (keywordDelta !== 0) {
        return keywordDelta;
      }

      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }

      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}

function extractPlaceIdFromGoogleMapsUrl(urlLike: string): string | null {
  try {
    // Tenta extrair place_id do formato: !1s0x935ef71d3c0f9a47:0x5f9ae5652cc04abe
    const placeIdMatch = urlLike.match(/!1s([^!]+)/);
    if (placeIdMatch && placeIdMatch[1]) {
      return placeIdMatch[1];
    }
    
    // Tenta extrair o ID do Google Maps format: 16s%2Fg%2F11rmy03d74
    const googleIdMatch = urlLike.match(/16s([^?&]+)/);
    if (googleIdMatch && googleIdMatch[1]) {
      const decodedId = decodeURIComponent(googleIdMatch[1]);
      return decodedId;
    }
    
    return null;
  } catch {
    return null;
  }
}

function extractQueryFromGoogleSearchUrl(urlLike: string): string | null {
  try {
    const parsed = new URL(urlLike);
    const query = parsed.searchParams.get("q")?.trim();
    return query && query.length > 0 ? query : null;
  } catch {
    return null;
  }
}

async function fetchPlaceIdFromQuery(apiKey: string, query: string): Promise<string | null> {
  const endpoint = new URL("https://maps.googleapis.com/maps/api/place/findplacefromtext/json");
  endpoint.searchParams.set("input", query);
  endpoint.searchParams.set("inputtype", "textquery");
  endpoint.searchParams.set("fields", "place_id,name");
  endpoint.searchParams.set("language", "pt-BR");
  endpoint.searchParams.set("key", apiKey);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      candidates?: Array<{ place_id?: string }>;
    };

    return payload.candidates?.[0]?.place_id ?? null;
  } catch {
    return null;
  }
}

async function fetchGooglePlacesReviews(): Promise<Review[] | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const configuredPlaceId = process.env.GOOGLE_PLACE_ID;
  const configuredSearchUrl = process.env.GOOGLE_SEARCH_URL ?? DEFAULT_SEARCH_URL;
  const configuredQuery = process.env.GOOGLE_PLACE_QUERY;

  if (!apiKey) {
    return null;
  }

  const queryFromUrl = extractQueryFromGoogleSearchUrl(configuredSearchUrl);
  const query = configuredQuery?.trim() || queryFromUrl || "ab sobrancelhas goiania";

  const resolvedPlaceId = configuredPlaceId ?? (await fetchPlaceIdFromQuery(apiKey, query));
  if (!resolvedPlaceId) {
    return null;
  }

  const endpoint = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  endpoint.searchParams.set("place_id", resolvedPlaceId);
  endpoint.searchParams.set("fields", "reviews");
  endpoint.searchParams.set("language", "pt-BR");
  endpoint.searchParams.set("key", apiKey);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      next: { revalidate: 60 * 60 * 4 },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      result?: { reviews?: Array<{ author_name?: string; rating?: number; text?: string; relative_time_description?: string }> };
    };

    const reviews = payload.result?.reviews ?? [];
    return reviews.map((review) => ({
      author: review.author_name || "Cliente",
      rating: review.rating || 0,
      comment: review.text || "",
      date: review.relative_time_description || "",
    }));
  } catch {
    return null;
  }
}

/**
 * Fetch and scrape Google Maps reviews from HTML (for client-side usage)
 * This function is designed to work with pre-fetched HTML from Google Maps
 * @param htmlContent - Complete HTML content from Google Maps reviews page
 * @returns Array of parsed Review objects
 */
export function scrapeGoogleMapsReviewsFromHTML(
  htmlContent: string
): Review[] {
  try {
    const reviews = extractAllReviewsFromHTML(htmlContent);
    return sanitizeAndFilterReviews(reviews);
  } catch (error) {
    console.error("Error scraping reviews from HTML:", error);
    return [];
  }
}

export async function getFilteredReviews(limit = 6): Promise<Review[]> {
  const apiReviews = await fetchGooglePlacesReviews();
  const allowMockFallback =
    process.env.ALLOW_MOCK_REVIEWS === "true" && process.env.NODE_ENV !== "production";
  const sourceReviews =
    apiReviews && apiReviews.length > 0
      ? apiReviews
      : allowMockFallback
        ? MOCK_REVIEWS
        : [];

  return sanitizeAndFilterReviews(sourceReviews).slice(0, Math.min(Math.max(limit, 3), 12));
}
