import type { GoogleReview } from "@/types/review.type";

const GOOGLE_PLACE_DETAILS_URL =
  "https://maps.googleapis.com/maps/api/place/details/json";

type GooglePlaceReviewPayload = {
  author_name?: string;
  rating?: number;
  text?: string;
  relative_time_description?: string;
  time?: number;
};

type GooglePlaceDetailsPayload = {
  result?: {
    reviews?: GooglePlaceReviewPayload[];
  };
  status?: string;
};

const FALLBACK_REVIEWS: GoogleReview[] = [
  {
    author_name: "Vitoria Naciff Lima",
    rating: 5,
    text:
      "Encantada com o atendimento! Além de me encaixar em um horario que eu podia com urgencia, me atendeu com muita atencao e educacao. Ambiente sem palavras para a beleza desse lugar. Me surpreendeu por completo o trabalho tao bem feito.",
    relative_time_description: "há 1 ano",
    time: 1744588800,
  },
  {
    author_name: "Beatriz Xoimbra",
    rating: 5,
    text:
      "O atelie mais lindo e aconchegante! As meninas sao super atenciosas e buscam valorizar as sobrancelhas naturais, fazendo com que as minhas ficassem mais lindas ao longo dos anos.",
    relative_time_description: "há 2 anos",
    time: 1713052800,
  },
  {
    author_name: "Larissa Araujo",
    rating: 5,
    text:
      "A melhor sem duvidas. Se voce quer sobrancelhas perfeitas, o lugar e aqui! Super indico pelas melhores profissionais e pelo melhor atendimento.",
    relative_time_description: "há 4 anos",
    time: 1649894400,
  },
  {
    author_name: "Isadora Gabrielly Campos",
    rating: 5,
    text:
      "Atendimento impecavel! Indico para todas as minhas amigas. Melhor lugar para fazer as sobrancelhas e cilios.",
    relative_time_description: "há 2 anos",
    time: 1713052800,
  },
  {
    author_name: "Jonatas Pain de Deus",
    rating: 5,
    text: "Faco minha sobrancelha la tem anos. Excelente profissional e atendimento.",
    relative_time_description: "há 2 anos",
    time: 1713052800,
  },
  {
    author_name: "Kellyany Pereira Silva",
    rating: 5,
    text: "Faco atendimentos com elas ha mais de 5 anos. Amo o trabalho delas e o cuidado super detalhista!",
    relative_time_description: "há 2 anos",
    time: 1713052800,
  },
];

function sortReviewsNewestFirst(reviews: GoogleReview[]): GoogleReview[] {
  return [...reviews].sort((a, b) => (b.time ?? 0) - (a.time ?? 0));
}

function normalizeReview(review: GooglePlaceReviewPayload): GoogleReview | null {
  if (
    !review.author_name ||
    typeof review.rating !== "number" ||
    !review.text ||
    !review.relative_time_description
  ) {
    return null;
  }

  return {
    author_name: review.author_name,
    rating: review.rating,
    text: review.text,
    relative_time_description: review.relative_time_description,
    time: review.time,
  };
}

export async function getGoogleReviews(): Promise<GoogleReview[]> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return FALLBACK_REVIEWS;
  }

  const endpoint = new URL(GOOGLE_PLACE_DETAILS_URL);
  endpoint.searchParams.set("place_id", placeId);
  endpoint.searchParams.set("key", apiKey);
  endpoint.searchParams.set("fields", "name,rating,reviews");
  endpoint.searchParams.set("language", "pt-BR");
  endpoint.searchParams.set("reviews_sort", "newest");

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return FALLBACK_REVIEWS;
    }

    const payload = (await response.json()) as GooglePlaceDetailsPayload;

    if (payload.status && payload.status !== "OK") {
      return FALLBACK_REVIEWS;
    }

    const reviews = (payload.result?.reviews ?? [])
      .map(normalizeReview)
      .filter((review): review is GoogleReview => review !== null);

    return reviews.length > 0 ? sortReviewsNewestFirst(reviews) : FALLBACK_REVIEWS;
  } catch {
    return FALLBACK_REVIEWS;
  }
}
