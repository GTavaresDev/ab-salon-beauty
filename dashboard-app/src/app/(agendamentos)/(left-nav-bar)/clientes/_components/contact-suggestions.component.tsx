"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { Card } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card.component";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import { formatPhoneBR } from "@/lib/input-masks";
import type { ClientProps } from "@core/application/query/interface/client.entity";
import { contactWhatsAppUrl } from "@/lib/contact-suggestions";

export function ContactSuggestions({ suggestions }: { suggestions: { client: ClientProps; lastVisit: string }[] }) {
  const [index, setIndex] = useState(0);
  if (!suggestions.length) return null;

  const position = Math.min(index, suggestions.length - 1);
  const { client, lastVisit } = suggestions[position];
  const [year, month, day] = lastVisit.split("-");

  return (
    <Card className="mb-8 border-[#E7C5CF] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-[#3D0F22]">Clientes para entrar em contato</h2>
        <div className="flex items-center gap-2" aria-label="Navegação das sugestões de contato">
          <button
            type="button"
            disabled={position === 0}
            onClick={() => setIndex(position - 1)}
            aria-label="Sugestão anterior"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B4A68] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <span className="min-w-12 text-center text-sm text-zinc-600" aria-live="polite">{position + 1} de {suggestions.length}</span>
          <button
            type="button"
            disabled={position === suggestions.length - 1}
            onClick={() => setIndex(position + 1)}
            aria-label="Próxima sugestão"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B4A68] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <article key={client.id} aria-label={`Contato de ${client.name}`} className="min-w-0 flex-1" aria-live="polite">
          <h3 className="font-semibold text-zinc-950">{client.name}</h3>
          <dl className="mt-3 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-xs text-zinc-500">Telefone</dt>
              <dd className="mt-1 text-zinc-900">{formatPhoneBR(client.phone)}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Última visita</dt>
              <dd className="mt-1 text-zinc-900">{day}/{month}/{year}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Situação</dt>
              <dd className="mt-1 text-zinc-900">Mais de 60 dias sem retorno</dd>
            </div>
          </dl>
        </article>
        <Button asChild className="w-full bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-700/30 sm:w-auto">
          <a href={contactWhatsAppUrl(client.phone, client.name)} target="_blank" rel="noopener noreferrer">
            <MessageCircle aria-hidden="true" /> Contatar pelo WhatsApp
          </a>
        </Button>
      </div>
    </Card>
  );
}
