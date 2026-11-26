// Exemplo de como usar o useReviewsScraper hook com a API

"use client";

import { useReviewsScraper } from "@/hooks/useReviewsScraper";
import { useState } from "react";

export default function ReviewsScraperWithAPI() {
  const [htmlInput, setHtmlInput] = useState("");
  const { loading, error, reviews, count, averageRating, scrape, reset } =
    useReviewsScraper({
      onSuccess: (reviews, count, avgRating) => {
        console.log(`✅ Scraped ${count} reviews with average rating ${avgRating}`);
      },
      onError: (error) => {
        console.error(`❌ Error: ${error}`);
      },
    });

  const handleScrape = async () => {
    await scrape(htmlInput);
  };

  return (
    <div className="space-y-6">
      <textarea
        value={htmlInput}
        onChange={(e) => setHtmlInput(e.target.value)}
        placeholder="Paste Google Maps HTML here..."
        rows={10}
        className="w-full p-3 border rounded"
      />

      <div className="flex gap-2">
        <button
          onClick={handleScrape}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          {loading ? "Scraping..." : "Scrape Reviews"}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Reset
        </button>
      </div>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      {reviews.length > 0 && (
        <div className="bg-blue-50 p-4 rounded">
          <h3 className="font-bold mb-2">Results</h3>
          <p>✅ Found {count} reviews</p>
          <p>⭐ Average rating: {averageRating}</p>

          <div className="mt-4 space-y-2">
            {reviews.map((review, i) => (
              <div key={i} className="bg-white p-2 rounded border">
                <p className="font-semibold">{review.author}</p>
                <p className="text-sm text-gray-600">{review.comment}</p>
                <p className="text-xs text-gray-500">{review.date} • ⭐ {review.rating}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
