import Image from "next/image";

import amandaBorges from "../../assets/amanda-borges.jpeg";

export function About() {
  return (
    <section id="about" className="section-shell py-16 sm:py-20" aria-label="Sobre o studio">
      <div className="grid gap-8 rounded-[2rem] border border-blush-200/80 bg-white p-6 shadow-xl shadow-blush-900/5 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div className="overflow-hidden rounded-3xl">
          <Image
            src={amandaBorges}
            alt="Amanda Borges em seu studio de estética facial em Goiânia"
            width={646}
            height={866}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.25em] text-blush-600">Sobre</p>
          <h2 className="font-[var(--font-cormorant)] text-4xl text-blush-900 sm:text-5xl">
            Referência em sobrancelhas e procedimentos faciais de alto padrão em Goiânia.
          </h2>
          <p className="text-sm leading-relaxed text-blush-800/85 sm:text-base">
            A AB Sobrancelhas nasceu para entregar experiencias sofisticadas com foco em naturalidade, simetria e
            autoestima. Cada atendimento comeca com analise personalizada de visagismo para construir um resultado
            exclusivo para voce.
          </p>
          <p className="text-sm leading-relaxed text-blush-800/85 sm:text-base">
            Aqui voce encontra tecnica, sensibilidade e protocolos modernos para sobrancelhas, labios e cuidados com a
            pele, em um ambiente acolhedor e elegante.
          </p>
        </div>
      </div>
    </section>
  );
}
