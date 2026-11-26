"use client";

import { useDelegatePermission } from "../hooks/use-delegate-permission";
import { Button } from "../../_components/ui/button.component";
import { Input } from "../../_components/ui/input.component";

export function DelegatePermission({ permissions }: { permissions: string[] }) {
  const {
    message,
    submit,
    pending,
  } = useDelegatePermission({ permissions });
  return (
    <form action={submit} className="m-6 grid max-w-md gap-4">
      <h1 className="text-xl font-semibold">Compartilhar permissão</h1>
      <label>E-mail do destinatário<Input name="email" type="email" required /></label>
      <label>Permissão
        <select name="permission" className="block w-full rounded-md border p-2" required>
          {permissions.map((name) => <option key={name}>{name}</option>)}
        </select>
      </label>
      <Button disabled={pending}>Compartilhar</Button>
      <p role="status">{message}</p>
    </form>
  );
}
