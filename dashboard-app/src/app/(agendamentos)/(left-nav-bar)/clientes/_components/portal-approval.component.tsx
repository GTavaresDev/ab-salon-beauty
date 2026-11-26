"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { approvePortalClient, rejectPortalClient } from "@core/application/query/controller/clients/portal-approval.controller";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";

import type { pendingPortalClients } from "@core/application/query/controller/clients/portal-approval.controller";
import { formatPhoneBR } from "@/lib/input-masks";
import { useClients } from "../hooks/use-clients";

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo",
});

export function PortalApproval({ clients }: { clients: Awaited<ReturnType<typeof pendingPortalClients>> }) {
  const router = useRouter();
  const { refreshClients } = useClients();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIndex = Math.max(0, clients.findIndex(client => client.id === selectedId));
  const client = clients[selectedIndex];
  async function approve(id: string) {
    setBusy(id);
    try {
      const result = await approvePortalClient(id);
      setMessage(result.success ? "Acesso aprovado." : result.error || "Não foi possível aprovar.");
      if (result.success) {
        try {
          await refreshClients();
        } catch {
          setMessage("Acesso aprovado. Atualize a página para ver o cliente na base.");
        }
      }
      router.refresh();
    } catch {
      setMessage("Não foi possível aprovar. Atualize a página e tente novamente.");
    } finally {
      setBusy(null);
    }
  }
  async function reject(id: string) {
    setBusy(id);
    try {
      const result = await rejectPortalClient(id);
      setMessage(result.success ? "Cadastro recusado e dados excluídos." : result.error || "Não foi possível recusar.");
      router.refresh();
    } catch {
      setMessage("Não foi possível recusar. Atualize a página e tente novamente.");
    } finally {
      setBusy(null);
    }
  }
  if (!clients.length && !message) return null;
  return (
    <section className="mx-auto max-w-375 px-4 pt-4 sm:px-6 lg:px-8">
      {client && <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Cadastros em análise</h2>
          <div className="flex items-center gap-2" aria-label="Navegação dos cadastros">
            <button type="button" aria-label="Cadastro anterior" disabled={selectedIndex === 0 || busy !== null}
              onClick={() => setSelectedId(clients[selectedIndex - 1].id)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40">
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <span className="min-w-12 text-center text-sm text-zinc-600" aria-live="polite">{selectedIndex + 1} de {clients.length}</span>
            <button type="button" aria-label="Próximo cadastro" disabled={selectedIndex === clients.length - 1 || busy !== null}
              onClick={() => setSelectedId(clients[selectedIndex + 1].id)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40">
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
          <article key={client.id} aria-label={`Cadastro de ${client.name}`} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-zinc-950">{client.name}</h3>
              <dl className="mt-3 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["E-mail", client.email || "Não informado"],
                  ["Telefone", client.phone ? formatPhoneBR(client.phone) : "Não informado"],
                  ["Data de nascimento", client.birthDate || "Não informada"],
                  ["Situação do cadastro", "Aguardando aprovação"],
                  ["Acesso ao portal", "Em análise"],
                  ["Cadastrado em", dateFormat.format(new Date(client.createdAt))],
                  ["Última atualização", dateFormat.format(new Date(client.updatedAt))],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-xs text-zinc-500">{label}</dt>
                    <dd className="mt-1 break-words text-zinc-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <Button disabled={busy !== null} onClick={() => approve(client.id)}>Aprovar acesso</Button>
              <Button variant="outline" disabled={busy !== null} onClick={() => reject(client.id)}>Recusar</Button>
            </div>
          </article>
      </div>}
      <p role="status" className="text-sm">{message}</p>
    </section>
  );
}
