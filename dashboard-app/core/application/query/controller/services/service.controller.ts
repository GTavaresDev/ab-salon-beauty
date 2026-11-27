"use server";

import { createServiceGateway } from "@core/server/gateway/service.gateway";
import type { ActionResult } from "@core/application/query/interface/action.interface";
import { ServiceProps } from "@core/application/query/interface/service.entity";
import { requireSessionAction } from "@core/application/query/controller/users/auth.controller";
import { canManageServices } from "@/lib/permissions";
import { formatActionError } from "@/lib/action-error-handler";

const { create: createService, list: listServices, update: updateService, delete: deleteService } = createServiceGateway();

export async function fetchServicesAction(): Promise<ServiceProps[]> {
  await requireSessionAction();
  const useCase = listServices;
  const services = await useCase.execute();
  return services.map((s) => s.toJSON());
}

async function requireServiceManagement(): Promise<void> {
  if (!canManageServices(await requireSessionAction())) {
    throw new Error("Sem permissão para alterar serviços.");
  }
}

export async function createServiceAction(input: {
  name: string;
  duration: number;
  description?: string;
  price?: number;
  status?: "Ativo" | "Inativo";
  color?: string;
}): Promise<ActionResult<ServiceProps>> {
  try {
    await requireServiceManagement();
    const useCase = createService;
    const created = await useCase.execute(input);
    return { success: true, data: created.toJSON() };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao cadastrar serviço.") };
  }
}

export async function updateServiceAction(input: {
  id: string;
  name?: string;
  duration?: number;
  description?: string;
  price?: number;
  status?: "Ativo" | "Inativo";
  color?: string;
}): Promise<ActionResult<ServiceProps>> {
  try {
    await requireServiceManagement();
    const useCase = updateService;
    const updated = await useCase.execute(input);
    return { success: true, data: updated.toJSON() };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao atualizar serviço.") };
  }
}

export async function deleteServiceAction(id: string): Promise<ActionResult<void>> {
  try {
    await requireServiceManagement();
    const useCase = deleteService;
    await useCase.execute(id);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao excluir serviço.") };
  }
}
