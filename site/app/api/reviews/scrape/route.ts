import { scrapeGoogleMapsReviewsFromHTML } from "@/services/reviews.service";

/**
 * POST /api/reviews/scrape
 * Scrapes and parses Google Maps reviews from provided HTML
 *
 * Request body:
 * {
 *   "htmlContent": "<div>...HTML...</div>"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "reviews": [...],
 *   "count": 5,
 *   "averageRating": 4.8
 * }
 */
export async function POST(request: Request) {
  try {
    const { htmlContent } = await request.json();

    if (!htmlContent) {
      return Response.json(
        {
          success: false,
          error: "htmlContent is required in request body",
        },
        { status: 400 }
      );
    }

    if (typeof htmlContent !== "string") {
      return Response.json(
        {
          success: false,
          error: "htmlContent must be a string",
        },
        { status: 400 }
      );
    }

    // Scrape the reviews
    const reviews = scrapeGoogleMapsReviewsFromHTML(htmlContent);

    if (reviews.length === 0) {
      return Response.json(
        {
          success: false,
          error:
            "No reviews found in the provided HTML. Check the HTML structure.",
        },
        { status: 422 }
      );
    }

    // Calculate average rating
    const averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    return Response.json(
      {
        success: true,
        reviews,
        count: reviews.length,
        averageRating: parseFloat(averageRating.toFixed(1)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error scraping reviews:", error);
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}
