export function PortalPendingNotice() {
  return (
    <div role="status" className="space-y-3 break-words rounded-xl border border-zinc-200 bg-zinc-100 p-4 text-sm leading-relaxed">
      <p className="text-green-800">Seu cadastro foi concluído com sucesso!</p>
      <p className="text-yellow-800">
        Seu cadastro está em análise. Assim que ele for aprovado, seu acesso ao sistema será liberado.
      </p>
    </div>
  );
}
