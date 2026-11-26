"use client";

import { useState } from "react";
import { scrapeGoogleMapsReviewsFromHTML } from "@/services/reviews.service";
import type { Review } from "@/types/review.type";

export default function ReviewsScraperComponent() {
  const [htmlInput, setHtmlInput] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleScrape = async () => {
    setError("");
    setReviews([]);

    if (!htmlInput.trim()) {
      setError("Por favor, cole o HTML da página do Google Maps");
      return;
    }

    setLoading(true);
    try {
      const extracted = scrapeGoogleMapsReviewsFromHTML(htmlInput);

      if (extracted.length === 0) {
        setError(
          "Nenhuma review encontrada. Verifique se o HTML está correto."
        );
      } else {
        setReviews(extracted);
      }
    } catch (err) {
      setError(`Erro ao processar: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setHtmlInput("");
    setReviews([]);
    setError("");
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🔍 Google Reviews Scraper
        </h2>
        <p className="text-gray-600 text-sm">
          Cole o HTML completo da página de reviews do Google Maps e extraia os
          dados automaticamente.
        </p>
      </div>

      {/* Input Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          HTML Content
        </label>
        <textarea
          value={htmlInput}
          onChange={(e) => setHtmlInput(e.target.value)}
          placeholder="Cole aqui o HTML da página do Google Maps..."
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
        <p className="text-xs text-gray-500 mt-2">
          💡 Dica: F12 → Inspect Element na seção de reviews → Copy → Paste aqui
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={handleScrape}
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          {loading ? "Processando..." : "Extrair Reviews"}
        </button>
        <button
          onClick={handleClear}
          className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
        >
          Limpar
        </button>
      </div>

      {/* Results Section */}
      {reviews.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-4 gap-4 text-center mb-6">
            <div>
              <p className="text-2xl font-bold text-blue-600">{reviews.length}</p>
              <p className="text-xs text-gray-600">Total Reviews</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
              </p>
              <p className="text-xs text-gray-600">Avg Rating</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {reviews.filter((r) => r.rating === 5).length}
              </p>
              <p className="text-xs text-gray-600">⭐ 5 Stars</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {reviews.filter((r) => r.rating === 4).length}
              </p>
              <p className="text-xs text-gray-600">⭐ 4 Stars</p>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Reviews Extraídas ({reviews.length})
          </h3>

          {reviews.map((review, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {review.author}
                  </h4>
                  <p className="text-xs text-gray-500">{review.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-yellow-500">
                    {"⭐".repeat(review.rating)}
                  </p>
                  <p className="text-xs text-gray-600">{review.rating}.0</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {htmlInput && reviews.length === 0 && !error && !loading && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Clique em &quot;Extrair Reviews&quot; para processar o HTML</p>
        </div>
      )}
    </div>
  );
}
