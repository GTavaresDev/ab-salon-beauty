import { getFilteredReviews } from "@/services/reviews.service";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { limit?: number };
    const limit = typeof body.limit === "number" ? body.limit : 6;
    const reviews = await getFilteredReviews(limit);
    if (reviews.length === 0) {
      return Response.json(
        {
          success: false,
          count: 0,
          reviews: [],
          error:
            "Nenhum comentario encontrado. Configure GOOGLE_PLACES_API_KEY (e opcionalmente GOOGLE_PLACE_ID/GOOGLE_PLACE_QUERY) para buscar reviews reais.",
        },
        { status: 422 }
      );
    }

    return Response.json(
      {
        success: true,
        count: reviews.length,
        reviews,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Falha ao buscar reviews",
      },
      { status: 500 }
    );
  }
}
