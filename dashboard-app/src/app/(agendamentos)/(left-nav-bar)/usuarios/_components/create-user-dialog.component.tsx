"use client";

import { useCreateUserDialog } from "../hooks/use-create-user-dialog";
import { CheckCircle2, Circle, X } from "lucide-react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card.component";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input.component";
import { FieldLabel } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/field-label.component";
import { UserProps } from "@core/application/query/interface/user.entity";
import type { StaffRole } from "@core/application/query/interface/user.entity";
import { formatPhoneBR } from "@/lib/input-masks";
import { getUserPasswordRequirements } from "@core/shared/user-password-policy";

export function CreateUserDialog({
  userList,
  currentUserRole,
  onAddUser,
  onClose,
  showToast,
}: {
  userList: UserProps[];
  currentUserRole: StaffRole;
  onAddUser: (user: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    permissionLevel?: 0 | 1 | 2 | 3;
    commissionPercent?: number;
  }) => Promise<void>;
  onClose: () => void;
  showToast: (message: string) => void;
}) {
  const {
    loading,
    phoneValue,
    setPhoneValue,
    password,
    setPassword,
    addUser,
  } = useCreateUserDialog({ userList, currentUserRole, onAddUser, onClose, showToast });

  return (
    <div
      className="fixed inset-0 lg:left-64 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden shadow-2xl">
        <CardHeader className="flex-row shrink-0 items-start justify-between">
          <div>
            <CardTitle>Adicionar usuário</CardTitle>
            <CardDescription>
              Cadastre um novo usuário com senha no PostgreSQL.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 -mt-2"
            onClick={() => {
              onClose();
              setPhoneValue("");
              setPassword("");
            }}
          >
            <X />
          </Button>
        </CardHeader>
        <form onSubmit={addUser} className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
          <CardContent className="space-y-4">
            <div>
              <FieldLabel>Nome completo</FieldLabel>
              <Input name="name" required placeholder="Ex.: João da Silva" />
            </div>
            <div>
              <FieldLabel>E-mail</FieldLabel>
              <Input name="email" required type="email" placeholder="joao@email.com" />
            </div>
            <div>
              <FieldLabel>Senha de Acesso</FieldLabel>
              <Input
                name="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite uma senha segura..."
              />
              <ul className="mt-2 space-y-1" aria-live="polite">
                {getUserPasswordRequirements(password).map((requirement) => (
                  <li
                    key={requirement.id}
                    className={`flex items-center gap-1.5 text-xs ${
                      requirement.met ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {requirement.met ? (
                      <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    ) : (
                      <Circle className="size-3.5" aria-hidden="true" />
                    )}
                    {requirement.label}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <FieldLabel>Telefone</FieldLabel>
              <Input
                name="phone"
                value={phoneValue}
                onChange={(event) => {
                  setPhoneValue(formatPhoneBR(event.target.value));
                }}
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(62) 99427-9139"
                maxLength={15}
              />
            </div>
            <div>
              <FieldLabel>Perfil</FieldLabel>
              <select
                name="permissionLevel"
                defaultValue={currentUserRole === "Gestor" ? "2" : "1"}
                className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 outline-none"
              >
                {currentUserRole === "Administrador" && (
                  <option value="1">Nível 1 — Administrador (Total)</option>
                )}
                <option value="2">Nível 2 — Gestor (Intermediário)</option>
                <option value="3">Nível 3 — Funcionário (Operacional)</option>
              </select>
            </div>
            <div>
              <FieldLabel>Percentual de comissão (%)</FieldLabel>
              <Input name="commissionPercent" type="number" min="0" max="100" step="0.01" defaultValue="0" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose();
                  setPhoneValue("");
                  setPassword("");
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando no banco..." : "Adicionar usuário"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
