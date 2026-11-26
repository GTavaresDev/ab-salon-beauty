import Link from "next/link";

import { getServices } from "@/services/content.service";

function parsePrice(value: string): number {
  return Number(value.replace("R$", "").replaceAll(".", "").replace(",", "."));
}

function getWhatsappLink(): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "556291390313";
  const message = encodeURIComponent("Ola, quero ajuda para escolher o melhor protocolo para mim.");
  return `https://wa.me/${number}?text=${message}`;
}

export async function Pricing() {
  const services = await getServices();
  const ordered = [...services].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));

  return (
    <section id="pricing" className="bg-white/70 py-16 sm:py-20" aria-label="Tabela de precos">
      <div className="section-shell">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-blush-600">Investimento</p>
          <h2 className="mt-3 font-[var(--font-cormorant)] text-4xl text-blush-900 sm:text-5xl">Tabela de valores</h2>
        </div>

        <div className="overflow-hidden rounded-3xl border border-blush-200/70 bg-white shadow-xl shadow-blush-900/5">
          <ul className="divide-y divide-blush-100">
            {ordered.map((service) => (
              <li
                key={service.title}
                className="grid grid-cols-1 items-center gap-3 px-6 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-blush-900">{service.title}</p>
                  <p className="text-sm text-blush-700/80">Atendimento personalizado</p>
                </div>
                <p className="text-xl font-bold text-blush-700 sm:text-right">{service.price}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link
            href={getWhatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-full bg-blush-800 px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-105 hover:bg-blush-700"
          >
            Quero uma avaliacao personalizada
          </Link>
        </div>
      </div>
    </section>
  );
}
