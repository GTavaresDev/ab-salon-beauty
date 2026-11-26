import type { CSSProperties } from "react";

import { FAQ_DATA } from "@/data/faq";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_DATA.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export function FAQ() {
  return (
    <section id="faq" className="section-shell py-16 sm:py-20" aria-label="Perguntas frequentes">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="mb-10 text-center" data-reveal="up">
        <p className="text-xs uppercase tracking-[0.25em] text-blush-600">Perguntas frequentes</p>
        <h2 className="mt-3 font-[var(--font-cormorant)] text-4xl text-blush-900 sm:text-5xl">
          Tire suas dúvidas antes de agendar
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-blush-800/85 sm:text-base">
          Informações rápidas sobre atendimento, procedimentos e agendamento na AB Sobrancelhas em Goiânia.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {FAQ_DATA.map((item, index) => (
          <article
            key={item.question}
            className="rounded-2xl border border-blush-200/80 bg-white p-6 shadow-lg shadow-blush-900/5"
            data-reveal="up"
            style={{ "--reveal-delay": `${index * 120}ms` } as CSSProperties}
          >
            <h3 className="font-[var(--font-cormorant)] text-2xl leading-tight text-blush-900">
              {item.question}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-blush-800/85">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
