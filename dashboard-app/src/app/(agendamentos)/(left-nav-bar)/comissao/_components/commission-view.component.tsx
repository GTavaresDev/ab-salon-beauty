"use client";

import { useMemo, useState, useEffect } from "react";
import { Download, Filter, ChevronDown } from "lucide-react";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge.component";
import { Card, CardHeader, CardTitle } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card.component";
import { ListPagination } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/list-pagination.component";
import { useAppointments } from "../../agenda/hooks/use-appointments";
import { fetchUsersAction } from "@core/application/query/controller/users/user.controller";
import type { UserProps } from "@core/application/query/interface/user.entity";

const money = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dateBR = (s: string) => new Date(`${s}T00:00:00`).toLocaleDateString("pt-BR");

export function CommissionView() {
  const { appointmentList, isLoading } = useAppointments();
  const [users, setUsers] = useState<UserProps[]>([]);
  const [professional, setProfessional] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => { void fetchUsersAction().then(setUsers); }, []);
  // The filter reset is intentionally synchronous with the local controls.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setPage(1), [professional, from, to]);
  const rows = useMemo(() => appointmentList.filter(a => a.status === "Concluído").map(a => {
    const user = users.find(u => u.id === a.userId) || users.find(u => u.name === a.userName);
    const percent = a.commissionPercent ?? 0;
    const amount = Number(a.servicePrice) || 0;
    return { ...a, percent, amount, commission: amount * percent / 100, professional: user?.name || a.userName || "Não informado" };
  }).filter(a => (!professional || a.userId === professional) && (!from || a.date >= from) && (!to || a.date <= to))
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)), [appointmentList, users, professional, from, to]);
  const visible = rows.slice((page - 1) * 10, page * 10);
  function exportCsv() {
    const header = ["Data","Horário","Procedimento","Cliente","Profissional","Valor","Pagamento","Percentual","Comissão"];
    const body = rows.map(r => [dateBR(r.date), r.time, r.service || "Não informado", r.name, r.professional, r.amount.toFixed(2).replace(".", ","), r.paymentMethod || "Não informado", `${r.percent}%`, r.commission.toFixed(2).replace(".", ",")]);
    const csv = "\uFEFF" + [header, ...body].map(line => line.map(v => `"${String(v).replaceAll('"', '""')}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = `comissoes-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }
  const card = "rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm";
  return <main className="space-y-6 p-4 md:p-8">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-zinc-900">Auditoria de comissões</h1><p className="text-sm text-zinc-500">Atendimentos concluídos e valores calculados.</p></div><button onClick={exportCsv} className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white"><Download size={16}/> Exportar Excel</button></div>
    <div className="grid gap-4 md:grid-cols-3"><div className={card}><p className="text-xs text-zinc-500">Atendimentos auditados</p><p className="mt-2 text-2xl font-bold">{rows.length}</p></div><div className={card}><p className="text-xs text-zinc-500">Valor dos atendimentos</p><p className="mt-2 text-2xl font-bold">{money(rows.reduce((s,r)=>s+r.amount,0))}</p></div><div className={card}><p className="text-xs text-zinc-500">Total de comissão</p><p className="mt-2 text-2xl font-bold text-emerald-600">{money(rows.reduce((s,r)=>s+r.commission,0))}</p></div></div>
    <section className={card}><div className="mb-4 flex items-center gap-2 text-sm font-semibold"><Filter size={16}/> Filtros</div><div className="grid gap-3 md:grid-cols-3"><div className="relative"><select value={professional} onChange={e=>setProfessional(e.target.value)} className="h-10 w-full appearance-none rounded-lg border px-3 pr-10 text-sm"><option value="">Todos os profissionais</option>{users.filter(u=>u.status === "Ativo").map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select><ChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" /></div><input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="h-10 rounded-lg border px-3 text-sm"/><input type="date" value={to} onChange={e=>setTo(e.target.value)} className="h-10 rounded-lg border px-3 text-sm"/></div></section>
    <Card className="overflow-visible">
      <CardHeader className="border-b border-zinc-100 bg-zinc-50/70 p-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            Auditoria de Comissões
          </CardTitle>
          <Badge variant="outline" className="h-8 w-fit px-2.5 text-xs font-normal">
            {rows.length} {rows.length === 1 ? "atendimento" : "atendimentos"}
          </Badge>
        </div>
      </CardHeader>
      <div className="hidden h-11 grid-cols-[.8fr_.7fr_1.4fr_1.2fr_1.2fr_.9fr_.8fr_.5fr_.9fr] items-center gap-4 border-b border-zinc-200 bg-zinc-50/70 px-5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 lg:grid">
        <span>Data</span><span>Horário</span><span>Procedimento</span><span>Cliente</span>
        <span>Profissional</span><span>Valor</span><span>Pagamento</span><span>%</span><span>Comissão</span>
      </div>
      <div className="min-h-65 divide-y divide-zinc-100">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-zinc-500">Carregando atendimentos...</div>
        ) : visible.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">Nenhum atendimento concluído encontrado.</div>
        ) : (
          visible.map((row) => (
            <div key={row.id} className="grid gap-2 p-4 text-sm transition-colors hover:bg-zinc-50/80 lg:grid-cols-[.8fr_.7fr_1.4fr_1.2fr_1.2fr_.9fr_.8fr_.5fr_.9fr] lg:items-center lg:gap-4 lg:px-5 lg:py-3">
              <span className="text-zinc-600">{dateBR(row.date)}</span>
              <span className="text-zinc-600">{row.time}</span>
              <span className="font-medium text-zinc-900">{row.service || "Não informado"}</span>
              <span className="text-zinc-700">{row.name}</span>
              <span className="text-zinc-700">{row.professional}</span>
              <span className="text-zinc-700">{money(row.amount)}</span>
              <span className="text-zinc-500">{row.paymentMethod || "Não informado"}</span>
              <span className="font-medium text-zinc-700">{row.percent}%</span>
              <span className="font-semibold text-emerald-600">{money(row.commission)}</span>
            </div>
          ))
        )}
      </div>
      <ListPagination page={page} totalItems={rows.length} onPageChange={setPage} label="atendimentos" pageSize={10} />
    </Card>
  </main>;
}
