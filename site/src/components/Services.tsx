import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { getServices } from "@/services/content.service";

function getWhatsappLink(serviceName: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "556291390313";
  const message = encodeURIComponent(
    `Ola, quero agendar o servico ${serviceName}.`,
  );
  return `https://wa.me/${number}?text=${message}`;
}

export async function Services() {
  const services = await getServices();

  return (
    <section
      id="services"
      className="bg-[#fffafc] py-20 sm:py-24"
      aria-label="Servicos"
    >
      <div className="section-shell">
        <div
          className="-mx-6 bg-blush-200 px-6 py-12 sm:py-14 lg:py-16"
          data-reveal="up"
        >
          <div className="section-shell">
            <div className="text-center">
              <p className="section-kicker">Especialidades</p>
              <h2 className="mt-3 font-[var(--font-cormorant)] text-4xl font-semibold leading-tight text-blush-900 sm:text-5xl lg:text-6xl">
                Como podemos te ajudar?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-blush-800/85 sm:text-lg">
                Conheça abaixo nosso portifólio de serviços especialmente
                pensados para sua beleza, saúde e bem-estar
              </p>
            </div>
          </div>
        </div>

        <div className="mb-10"></div>

        <div className="divide-y divide-blush-200/70">
          {services.map((service, index) => {
            return (
              <article
                key={`${service.title}-${index}`}
                itemScope
                itemType="https://schema.org/Service"
                className="group grid gap-6 py-8 first:pt-0 last:pb-0 lg:grid-cols-2 lg:items-start lg:gap-10"
                data-reveal="up"
                style={
                  {
                    "--reveal-delay": `${Math.min(index, 4) * 90}ms`,
                  } as CSSProperties
                }
              >
                {/* Foto sempre à esquerda */}
                <div className="lg:order-1">
                  <div className="soft-image-frame aspect-[4/3] bg-blush-100 lg:aspect-[16/10]">
                    <Image
                      src={service.image}
                      alt={service.alt}
                      fill
                      sizes="(min-width: 1024px) 35vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                      data-reveal-image=""
                      style={
                        {
                          "--reveal-delay": `${Math.min(index, 4) * 90}ms`,
                        } as CSSProperties
                      }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blush-900/20 via-transparent to-transparent opacity-80" />
                  </div>
                </div>

                {/* Textos sempre à direita */}
                <div className="lg:order-2">
                  <p className="text-xs font-semibold text-blush-500">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3
                    itemProp="name"
                    className="mt-2 font-[var(--font-cormorant)] text-2xl font-semibold leading-tight text-blush-900 sm:text-3xl lg:text-3xl"
                  >
                    {service.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-blush-800/85 sm:text-base">
                    {service.description}
                  </p>
                  <div className="mt-5">
                    <Link
                      href={getWhatsappLink(service.title)}
                      target="_blank"
                      rel="noreferrer"
                      className="premium-cta w-full sm:w-auto"
                    >
                      Chamar no WhatsApp
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
