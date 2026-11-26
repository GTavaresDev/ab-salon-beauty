"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const CLINIC_IMAGES = [
  {
    src: "/assets/novas-fotos/clinic-gallery-01.jpeg",
    alt: "Ambiente da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-02.jpeg",
    alt: "Espaço de atendimento da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-03.jpeg",
    alt: "Detalhes do espaço da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-04.jpeg",
    alt: "Área interna da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-05.jpeg",
    alt: "Estrutura da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-06.jpeg",
    alt: "Sala de atendimento da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-07.jpeg",
    alt: "Ambiente preparado para procedimentos na clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-08.jpeg",
    alt: "Espaço de beleza da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-09.jpeg",
    alt: "Interior da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-10.jpeg",
    alt: "Detalhes do ambiente da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-11.jpeg",
    alt: "Estrutura interna da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-12.jpeg",
    alt: "Sala da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-13.jpeg",
    alt: "Espaço completo da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-14.jpeg",
    alt: "Ambiente acolhedor da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-15.jpeg",
    alt: "Área de atendimento da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-16.jpeg",
    alt: "Vista do espaço da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-17.jpeg",
    alt: "Ambiente de beleza da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-18.jpeg",
    alt: "Espaço interno organizado da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-19.jpeg",
    alt: "Sala equipada da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-20.jpeg",
    alt: "Área da clínica AB Sobrancelhas preparada para receber clientes",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-21.jpeg",
    alt: "Visão do espaço da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-22.webp",
    alt: "Ambiente elegante da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-23.webp",
    alt: "Detalhes do atendimento na clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-24.webp",
    alt: "Espaço interno refinado da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-25.webp",
    alt: "Área de recepção da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-26.webp",
    alt: "Composição do espaço da clínica AB Sobrancelhas",
  },
  {
    src: "/assets/novas-fotos/clinic-gallery-27.webp",
    alt: "Experiência completa no espaço da clínica AB Sobrancelhas",
  },
];

export function ClinicGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const images = useMemo(() => CLINIC_IMAGES, []);

  function goToSlide(index: number) {
    setActiveIndex((index + images.length) % images.length);
  }

  function handleTouchEnd(clientX: number) {
    if (touchStart === null) {
      return;
    }

    const distance = touchStart - clientX;
    if (Math.abs(distance) > 45) {
      goToSlide(activeIndex + (distance > 0 ? 1 : -1));
    }
    setTouchStart(null);
  }

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [images.length]);

  return (
    <section
      className="bg-white py-20 sm:py-24"
      aria-labelledby="clinic-gallery-title"
    >
      <div className="section-shell">
        {/* Header com layout centralizado e elegante */}
        <div
          className="mb-16 flex flex-col items-center text-center"
          data-reveal="up"
        >
          {/* Kicker com estilo delicado */}
          <p className="mb-4 text-sm font-light tracking-widest uppercase text-blush-600 opacity-80 lg:mb-6">
            Nosso espaço
          </p>

          {/* Linha decorativa delicada */}
          <div className="mb-6 h-px w-12 bg-gradient-to-r from-transparent via-blush-300 to-transparent lg:mb-8" />

          {/* Título principal - maior e centralizado */}
          <h2
            id="clinic-gallery-title"
            className="font-[var(--font-cormorant)] text-5xl font-light leading-tight text-blush-900 sm:text-6xl lg:text-7xl"
          >
            Além de procedimentos,
            <span className="block mt-2 font-normal text-blush-800">
              uma experiência completa de beleza
            </span>
          </h2>
        </div>

        {/* Galeria de imagens */}
        <div
          className="relative overflow-hidden rounded-lg shadow-2xl shadow-blush-900/10"
          data-reveal="up"
          aria-roledescription="carousel"
          aria-label="Galeria de imagens da clínica"
          onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
          onTouchEnd={(event) =>
            handleTouchEnd(event.changedTouches[0].clientX)
          }
        >
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {images.map((image, index) => (
              <div
                key={image.src}
                className="relative aspect-[7/5] w-full shrink-0 sm:h-[560px] sm:aspect-auto lg:h-[680px] xl:h-[740px]"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} de ${images.length}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-blush-900/50 via-blush-900/12 to-transparent" />
              </div>
            ))}
          </div>

          {/* Botões de navegação */}
          <button
            type="button"
            onClick={() => goToSlide(activeIndex - 1)}
            className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg bg-white/90 text-2xl leading-none text-blush-900 shadow-lg shadow-blush-900/15 transition-all duration-300 hover:-translate-x-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Imagem anterior"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => goToSlide(activeIndex + 1)}
            className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg bg-white/90 text-2xl leading-none text-blush-900 shadow-lg shadow-blush-900/15 transition-all duration-300 hover:translate-x-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Próxima imagem"
          >
            ›
          </button>

          {/* Dots para mobile */}
          <div
            className="absolute inset-x-0 bottom-5 flex justify-center gap-2 sm:hidden"
            aria-label="Selecionar imagem"
          >
            {images.map((image, index) => (
              <button
                key={`dot-${image.src}`}
                type="button"
                onClick={() => goToSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  activeIndex === index
                    ? "w-8 bg-white"
                    : "w-2.5 bg-white/55 hover:bg-white/80"
                }`}
                aria-label={`Ir para imagem ${index + 1}`}
                aria-current={activeIndex === index}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
