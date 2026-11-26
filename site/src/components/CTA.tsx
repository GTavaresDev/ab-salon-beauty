import Link from "next/link";
import type { CSSProperties } from "react";

const MAP_EMBED_URL =
  "https://www.google.com/maps?q=AB+Sobrancelhas+Goiania&output=embed";
const MAP_LINK_URL =
  "https://www.google.com/maps/search/?api=1&query=AB+Sobrancelhas+Goiania";

function getWhatsappLink(): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "556291390313";
  const message = encodeURIComponent("Ola, quero agendar um atendimento na AB Sobrancelhas.");
  return `https://wa.me/${number}?text=${message}`;
}

export function CTA() {
  return (
    <section id="cta" className="pb-20 pt-8" aria-label="Call to action">
      <div className="section-shell">
        <div
          className="relative overflow-hidden rounded-[2rem] bg-blush-900 px-6 py-12 text-white sm:px-10 lg:px-12 lg:py-14"
          data-reveal="up"
        >
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blush-300/30 blur-2xl" />
          <div className="absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)] lg:items-center">
            <div
              className="max-w-2xl space-y-5"
              data-reveal="left"
              style={{ "--reveal-delay": "100ms" } as CSSProperties}
            >
              <p className="text-xs uppercase tracking-[0.24em] text-blush-100/90">Pronta para se sentir ainda mais confiante?</p>
              <h2 className="font-[var(--font-cormorant)] text-4xl leading-tight sm:text-5xl">
                Reserve seu horario e descubra o protocolo ideal para o seu rosto.
              </h2>
              <p className="text-sm text-blush-100/85 sm:text-base">
                Clique abaixo para falar no WhatsApp e receber orientacao personalizada em poucos minutos.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href={getWhatsappLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white px-7 py-3 text-sm font-bold text-blush-900 transition-all duration-300 hover:scale-105"
                >
                  Agendar pelo WhatsApp
                </Link>
                <Link
                  href="https://www.instagram.com/amandaborges.beauty"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10"
                >
                  Ver Instagram
                </Link>
              </div>
            </div>

            <div data-reveal="right" style={{ "--reveal-delay": "200ms" } as CSSProperties}>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.24em] text-blush-100/90">Venha nos conhecer</p>
                <h3 className="mt-2 font-[var(--font-cormorant)] text-3xl leading-tight text-white sm:text-4xl">
                  Estamos esperando por voce.
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-blush-100/85">
                  Toque no mapa para abrir a localizacao no Google Maps.
                </p>
              </div>
              <a
                href={MAP_LINK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-lg shadow-blush-950/20 transition-all duration-300 hover:scale-[1.01]"
                aria-label="Abrir localizacao da AB Sobrancelhas no Google Maps"
              >
                <iframe
                  src={MAP_EMBED_URL}
                  title="Mapa da AB Sobrancelhas"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="pointer-events-none h-[220px] w-full border-0 sm:h-[260px]"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
