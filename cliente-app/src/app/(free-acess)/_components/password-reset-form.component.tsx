"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/portal-ui/button.component";
import { Input } from "@/components/portal-ui/input.component";

export function PasswordResetForm() {
  const dialog = useRef<HTMLDialogElement>(null);
  const messageText = useRef<HTMLParagraphElement>(null);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");

  function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim();
    const email = String(data.get("email")).trim();
    setMessage(`Olá, gostaria de recuperar minha senha.\nNome: ${name}\nE-mail: ${email}`);
    setFeedback("");
    dialog.current?.showModal();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setFeedback("Mensagem copiada.");
    } catch {
      if (messageText.current) {
        window.getSelection()?.selectAllChildren(messageText.current);
      }
      setFeedback("Selecione a opção Copiar do seu dispositivo.");
    }
  }

  return (
    <>
      <form onSubmit={generate} className="space-y-5">
        <label className="block text-sm font-medium text-zinc-800">
          Nome
          <Input className="mt-2" name="name" autoComplete="name" required pattern={".*\\S.*"} />
        </label>
        <label className="block text-sm font-medium text-zinc-800">
          E-mail
          <Input className="mt-2" name="email" type="email" autoComplete="email" required />
        </label>
        <Button
          className="w-full bg-[#F8C5CE] font-semibold text-[#3D0F22] hover:bg-[#F4B6C6] focus-visible:ring-[#7A3350] focus-visible:ring-offset-2"
          size="lg"
          type="submit"
        >
          Gerar mensagem
        </Button>
      </form>

      <dialog ref={dialog} aria-labelledby="whatsapp-heading"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-6 text-zinc-950 shadow-xl backdrop:bg-black/45">
        <h2 id="whatsapp-heading" className="text-lg font-semibold">
          Envie essa mensagem para o WhatsApp da clínica
        </h2>
        <p ref={messageText} className="my-4 whitespace-pre-line break-words rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700">
          {message}
        </p>
        <p role="status" className="text-sm text-zinc-600">{feedback}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => dialog.current?.close()}>Fechar</Button>
          <Button onClick={copy}>Copiar mensagem</Button>
        </div>
      </dialog>
    </>
  );
}
