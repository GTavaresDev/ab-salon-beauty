"use client";

import { type FormEvent } from "react";
import { useState } from "react";
import { ServiceProps } from "@core/application/query/interface/service.entity";

export interface ServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Omit<ServiceProps, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  initialData?: ServiceProps | null;
  loading?: boolean;
}

export function useServiceForm({
  open,
  onOpenChange,
  onSave,
  initialData,
  loading,
}: ServiceModalProps) {
  const [name, setName] = useState<string>(initialData?.name ?? "");
  const [description, setDescription] = useState<string>(initialData?.description ?? "");
  const [duration, setDuration] = useState<string>(String(initialData?.duration ?? 60));
  const [price, setPrice] = useState<string>(String(initialData?.price ?? ""));
  const [status, setStatus] = useState<string>(initialData?.status ?? "Ativo");
  const [color, setColor] = useState<string>(initialData?.color ?? "");
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setDescription("");
    setDuration("60");
    setPrice("");
    setStatus("Ativo");
    setColor("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nome do serviço é obrigatório");
      return;
    }

    if (!duration || parseInt(duration) <= 0) {
      setError("Duração deve ser maior que zero");
      return;
    }

    if (price && isNaN(parseFloat(price))) {
      setError("Preço deve ser um número válido");
      return;
    }

    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        duration: parseInt(duration),
        price: price ? parseFloat(price) : undefined,
        status: status as "Ativo" | "Inativo",
        color: color || undefined,
      });
      resetForm();
    } catch {
      // Error is handled by the parent component
    }
  };
  return {
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
  };
}
