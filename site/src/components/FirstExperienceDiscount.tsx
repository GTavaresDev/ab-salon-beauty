import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import descontoCard from "../../assets/foto-do-desconto.jpeg";

function getWhatsappLink(): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "556291390313";
  const message = encodeURIComponent(
    "Ola, quero agendar minha primeira experiencia na AB Sobrancelhas.",
  );
  return `https://wa.me/${number}?text=${message}`;
}

export function FirstExperienceDiscount() {
  return (
    <section
      className="bg-white py-16 sm:py-20"
      aria-label="Desconto primeira experiência"
    >
      <div className="section-shell">
        <div
          className="relative overflow-hidden rounded-lg bg-[linear-gradient(135deg,#fff7fa_0%,#ffffff_48%,#f3e2e8_100%)] px-4 py-8 shadow-xl shadow-blush-900/5 sm:px-8 lg:px-10 lg:py-10"
          data-reveal="up"
        >
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-12">
            <div className="order-2 lg:order-1">
              <p className="section-kicker">Primeira experiência</p>
              <h2 className="mt-4 font-[var(--font-cormorant)] text-4xl font-semibold leading-tight text-blush-900 sm:text-5xl lg:text-6xl">
                Você ganhou 10% de desconto na sua primeira experiência.
              </h2>
              <p
                className="mt-4 text-base font-semibold leading-relaxed text-blush-700 sm:text-lg"
                style={{ "--reveal-delay": "100ms" } as CSSProperties}
              >
                Nada de sobrancelhas afinadas por aqui!
              </p>
              <p
                className="mt-5 max-w-xl border-l border-blush-300 pl-5 text-xl font-semibold leading-snug text-blush-900 sm:text-2xl"
                style={{ "--reveal-delay": "150ms" } as CSSProperties}
              >
                Traga um amigo e ganhe um Design de Sobrancelhas 100% grátis
              </p>
              <div
                className="mt-8"
                data-reveal="up"
                style={{ "--reveal-delay": "300ms" } as CSSProperties}
              >
                <Link
                  href={getWhatsappLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="premium-cta w-full sm:w-auto"
                >
                  Agendar pelo WhatsApp
                </Link>
              </div>
            </div>

            <div className="order-1 mx-auto w-full max-w-md lg:order-2">
              <Image
                src={descontoCard}
                alt="Cartão de desconto de primeira experiência na AB Sobrancelhas"
                priority
                sizes="(min-width: 1024px) 448px, (min-width: 640px) 448px, calc(100vw - 48px)"
                className="h-auto w-full rounded-lg shadow-2xl shadow-blush-900/[0.12]"
                data-reveal-image=""
                style={{ "--reveal-delay": "200ms" } as CSSProperties}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
