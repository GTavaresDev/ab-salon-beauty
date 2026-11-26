import { useState, useCallback } from "react";
import type { Review } from "@/types/review.type";

interface UseReviewsScraperOptions {
  onSuccess?: (reviews: Review[], count: number, avgRating: number) => void;
  onError?: (error: string) => void;
}

interface ScrapingResult {
  success: boolean;
  reviews: Review[];
  count: number;
  averageRating: number;
  error?: string;
}

/**
 * Hook for scraping Google Maps reviews via API
 * @param options - Callback options
 * @returns Loading state, scrape function, and results
 */
export function useReviewsScraper(options?: UseReviewsScraperOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<ScrapingResult | null>(null);

  const scrape = useCallback(
    async (htmlContent: string) => {
      setError("");
      setLoading(true);

      try {
        const response = await fetch("/api/reviews/scrape", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ htmlContent }),
        });

        const data = (await response.json()) as ScrapingResult;

        if (!response.ok) {
          const errorMsg = data.error || "Failed to scrape reviews";
          setError(errorMsg);
          options?.onError?.(errorMsg);
          return null;
        }

        setResult(data);
        options?.onSuccess?.(data.reviews, data.count, data.averageRating);
        return data;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMsg);
        options?.onError?.(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setError("");
    setLoading(false);
    setResult(null);
  }, []);

  return {
    loading,
    error,
    result,
    reviews: result?.reviews || [],
    count: result?.count || 0,
    averageRating: result?.averageRating || 0,
    scrape,
    reset,
  };
}
