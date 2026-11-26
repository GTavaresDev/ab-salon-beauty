"use client";

import { useServiceForm, type ServiceModalProps } from "../hooks/use-service-form";
import { type ReactNode } from "react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input.component";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card.component";
import { X } from "lucide-react";

const FieldLabel = ({ children }: { children: ReactNode }) => (
  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600">{children}</label>
);

export function ServiceModal(props: ServiceModalProps) {
  if (!props.open) return null;
  return <ServiceForm key={props.initialData?.id ?? "new"} {...props} />;
}

function ServiceForm({
  open,
  onOpenChange,
  onSave,
  initialData,
  loading,
}: ServiceModalProps) {
  const {
    name,
    setName,
    description,
    setDescription,
    duration,
    setDuration,
    price,
    setPrice,
    status,
    setStatus,
    color,
    setColor,
    error,
    resetForm,
    handleSubmit,
  } = useServiceForm({ open, onOpenChange, onSave, initialData, loading });

  if (!open) return null;

  const isEditing = !!initialData;

  return (
    <div
      className="fixed inset-0 lg:left-64 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onOpenChange(false)}
    >
      <Card className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden shadow-2xl">
        <CardHeader className="flex-row shrink-0 items-start justify-between">
          <div>
            <CardTitle>{isEditing ? "Editar serviço" : "Adicionar serviço"}</CardTitle>
            <CardDescription>
              {isEditing
                ? "Atualize as informações do serviço cadastrado no banco."
                : "Cadastre um novo serviço para utilização nos agendamentos."}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 -mt-2"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
          >
            <X />
          </Button>
        </CardHeader>
        <form onSubmit={handleSubmit} className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <FieldLabel>Nome do Serviço</FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Consulta inicial"
                disabled={loading}
                required
              />
            </div>

            <div>
              <FieldLabel>Descrição</FieldLabel>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição do serviço"
                disabled={loading}
                rows={3}
                className="w-full h-auto px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Duração (minutos)</FieldLabel>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <FieldLabel>Preço (R$)</FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Status</FieldLabel>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={loading}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 outline-none"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div>
                <FieldLabel>Cor</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    disabled={loading}
                    className="h-10 w-12 p-1"
                  />
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#000000"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : isEditing ? "Atualizar serviço" : "Adicionar serviço"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
