import { getGoogleReviews } from "@/services/google-reviews.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const reviews = await getGoogleReviews();

  return Response.json(
    { reviews },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
