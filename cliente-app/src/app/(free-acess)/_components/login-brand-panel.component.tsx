import Image from "next/image";
import { Bell } from "lucide-react";
import styles from "./login-brand-panel.module.css";

const steps = [
  ["Escolha o serviço", "Veja as opções disponíveis"],
  ["Selecione o horário", "Só aparecem horários livres"],
  ["Receba a confirmação", "Aviso no WhatsApp quando o horário for confirmado"],
];

const cardClass =
  "relative rounded-[20px] bg-white px-5 py-4 shadow-xl shadow-[#5C1A33]/10";

export function LoginBrandPanel() {
  return (
    <section className="relative isolate hidden flex-col overflow-hidden bg-linear-to-br from-[#F9CAD5] to-[#F4B6C6] px-6 py-6 text-[#5C1A33] sm:px-10 lg:flex lg:px-12 lg:py-9">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 size-80 rounded-full bg-white/35 blur-3xl" />
        <div className="absolute -bottom-28 -left-24 size-80 rounded-full bg-[#B8912F]/15 blur-3xl" />
        <div className="absolute top-36 -right-32 size-96 rounded-full border border-white/30" />
        <div className="absolute top-52 -right-16 size-64 rounded-full border border-white/35" />
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
        <div className="flex items-center gap-3">
          <Image
            src="/images/brand/logo-monograma-ab.svg"
            alt=""
            width={52}
            height={40}
            className="h-10 w-auto shrink-0"
          />
          <span className="hidden text-[11px] font-medium tracking-[0.25em] text-[#9B4A68] lg:inline-block">
            GESTÃO &amp; AGENDA
          </span>
        </div>

        <div className="mt-4 lg:mt-8">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-white/85 bg-white/55 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.18em]">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[#B8912F] ring-3 ring-[#B8912F]/20" />
            AGENDAMENTO ONLINE
          </p>
          <h2 className="mt-3 max-w-lg text-3xl leading-[1.1] font-semibold tracking-[-0.04em] lg:mt-4 lg:text-5xl">
            Seu{" "}
            <span className="relative inline-block text-[#3D0F22] after:absolute after:-bottom-1 after:left-0 after:h-[3px] after:w-full after:-rotate-2 after:bg-[#B8912F] after:content-['']">
              horário
            </span>
            , do seu jeito.
          </h2>
          <p className="mt-4 hidden max-w-md text-sm leading-6 text-[#7A3350] lg:block">
            Escolha o serviço, o profissional e o melhor horário em poucos toques. Você recebe a confirmação e acompanha tudo por aqui.
          </p>
        </div>

        <div aria-hidden="true" className="pointer-events-none mt-6 hidden max-w-[440px] flex-col py-1 text-sm lg:flex">
          <div className={`${cardClass} ${styles.float} mr-8 -rotate-2 self-start`}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="font-semibold">Seu próximo horário</p>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">Confirmado</span>
            </div>
            <p className="mt-1.5 text-xs text-[#7A3350]">Corte e escova com Marina Costa</p>
            <p className="mt-1 text-xs font-semibold">12 de dezembro • 14:30</p>
          </div>

          <div className={`${cardClass} ${styles.float} -mt-1.5 ml-8 rotate-1 self-end [animation-delay:-2s]`}>
            <p className="font-semibold">Escolha o horário</p>
            <div className="mt-1.5 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-lg border border-[#5C1A33]/15 px-2.5 py-1.5">14:00</span>
              <span className="rounded-lg bg-[#F8C5CE] px-2.5 py-1.5">14:30</span>
              <span className="rounded-lg border border-[#5C1A33]/15 px-2.5 py-1.5">15:00</span>
            </div>
          </div>

          <div className={`${cardClass} ${styles.float} -mt-1.5 mr-8 flex -rotate-1 items-center gap-3 self-start [animation-delay:-4s]`}>
            <Bell className="size-5 shrink-0 text-[#7A3350]" />
            <div>
              <p className="font-semibold">Confirmação no WhatsApp</p>
              <p className="mt-0.5 text-xs text-[#7A3350]">Você recebe um aviso quando o horário for confirmado</p>
            </div>
          </div>
        </div>

        <ol className="mt-6 hidden gap-3 lg:grid">
          {steps.map(([title, description], index) => (
            <li key={title} className="flex items-center gap-2.5">
              <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-sm font-semibold shadow-sm">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-[#7A3350]">{description}</p>
              </div>
            </li>
          ))}
        </ol>

        <footer className="mt-auto hidden pt-6 lg:block">
          <p className="border-t border-[#5C1A33]/15 pt-4 text-sm text-[#7A3350]">
            Agendar ficou simples.
          </p>
        </footer>
      </div>
    </section>
  );
}
