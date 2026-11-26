import type { CSSProperties } from "react";

import { getGoogleReviews } from "@/services/google-reviews.service";

function Stars({ rating }: { rating: number }) {
  const normalizedRating = Math.max(0, Math.min(Math.round(rating), 5));

  return (
    <div className="flex items-center gap-1" aria-label={`Avaliacao ${rating} de 5`}>
      <span className="text-sm text-amber-400" aria-hidden="true">
        {"⭐".repeat(normalizedRating)}
      </span>
    </div>
  );
}

export async function Testimonials() {
  const reviews = await getGoogleReviews();

  return (
    <section id="testimonials" className="section-shell py-16 sm:py-20" aria-label="Depoimentos de clientes">
      <div className="mb-10 text-center" data-reveal="up">
        <p className="text-xs uppercase tracking-[0.25em] text-blush-600">Confianca real</p>
        <h2 className="mt-3 font-[var(--font-cormorant)] text-4xl text-blush-900 sm:text-5xl">O que dizem nossas clientes</h2>
      </div>

      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review, index) => (
            <article
              key={`${review.author_name}-${index}`}
              className="rounded-3xl border border-blush-200/80 bg-white p-6 shadow-lg shadow-blush-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              data-reveal="up"
              style={{ "--reveal-delay": `${index * 120}ms` } as CSSProperties}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-blush-900">{review.author_name}</h3>
                  <p className="mt-1 text-xs text-blush-700/70">{review.relative_time_description}</p>
                </div>
                <Stars rating={review.rating} />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-blush-800/85">{review.text}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-blush-800/80">
          As avaliacoes serao exibidas aqui assim que estiverem disponiveis.
        </p>
      )}
    </section>
  );
}
