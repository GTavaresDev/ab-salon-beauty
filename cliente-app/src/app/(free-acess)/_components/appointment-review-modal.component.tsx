"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { submitAppointmentReviewAction, type PendingAppointmentReview } from "@core/application/query/controller/read-appointment.controller";

export function AppointmentReviewModal({ reviews, clientName }: { reviews: PendingAppointmentReview[]; clientName: string }) {
  const [current, setCurrent] = useState<PendingAppointmentReview | null>(null);
  const [rating, setRating] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(false);

  useEffect(() => {
    const queryId = new URLSearchParams(window.location.search).get("avaliar");
    const requested = reviews.find((review) => review.appointmentId === queryId);
    setCurrent(requested ?? reviews[0] ?? null);
  }, [reviews]);

  if (!current) return null;
  const formattedTime = new Date(`2000-01-01T${current.time}:00`).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  async function submit() {
    if (!rating || !current) return;
    setBusy(true); setError("");
    const result = await submitAppointmentReviewAction(current.appointmentId, rating);
    setBusy(false);
    if (!result.success) { setError(result.error || "Não foi possível enviar. Tente novamente."); return; }
    setConfirmation(true);
    window.setTimeout(() => {
      setCurrent(reviews.find((item) => item.appointmentId !== current.appointmentId) ?? null);
      setRating(0); setConfirmation(false);
      const url = new URL(window.location.href); url.searchParams.delete("avaliar"); window.history.replaceState({}, "", url);
    }, 1600);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="review-title" className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
        {confirmation ? <div role="status" className="py-8"><p className="text-3xl">💛</p><h2 className="mt-3 text-lg font-semibold">Obrigada pela sua avaliação!</h2><p className="mt-1 text-sm text-zinc-500">Sua opinião ajuda a melhorar nosso atendimento.</p></div> : <>
          <h2 id="review-title" className="mt-5 text-lg font-semibold text-zinc-950">Como foi seu último atendimento com {current.professionalName || "nossa equipe"} às {formattedTime}?</h2>
          <p className="mt-2 text-sm text-zinc-500">Olá, {clientName}. Escolha uma nota de 1 a 5.</p>
          <div className="mt-6 flex justify-center gap-2" role="group" aria-label="Nota de satisfação">
            {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" aria-label={`${value} de 5`} aria-pressed={rating === value} onClick={() => setRating(value)} className="rounded-lg p-2 text-amber-500 transition hover:scale-110"><Star className={`size-8 ${rating >= value ? "fill-current" : ""}`} /></button>)}
          </div>
          {error ? <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <button type="button" disabled={!rating || busy} onClick={submit} className="mt-6 w-full rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Enviando…" : "Enviar avaliação"}</button>
        </>}
      </section>
    </div>
  );
}
