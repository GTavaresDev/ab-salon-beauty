"use server";

import { createClientGateway } from "@core/server/gateway/client.gateway";
import type { ActionResult } from "@core/application/query/interface/action.interface";
import { ClientProps } from "@core/application/query/interface/client.entity";
import { requireSessionAction } from "@core/application/query/controller/users/auth.controller";
import { formatActionError } from "@/lib/action-error-handler";
import { canAccessOperationalCatalog } from "@/lib/permissions";

const clientFactory = createClientGateway();
const { create: createClient, list: listClients, update: updateClient, delete: deleteClient } = clientFactory;

export async function fetchClientsAction(): Promise<ClientProps[]> {
  const session = await requireSessionAction();
  requireClientAccess(session);
  const useCase = listClients;
  const clients = await useCase.execute();
  return clients.map((c) => sanitizeClient(c.toJSON(), session));
}

function isAdmin(session: Awaited<ReturnType<typeof requireSessionAction>>): boolean {
  return session.permissionLevel === 1 || session.role === "Administrador";
}

function sanitizeClient(client: ClientProps, session: Awaited<ReturnType<typeof requireSessionAction>>): ClientProps {
  if (isAdmin(session)) return client;

  // Undefined fields are omitted from the Server Action payload, so non-admin
  // roles never receive a client's e-mail.
  const { email: _email, ...safeClient } = client;
  return safeClient as ClientProps;
}

function requireClientAccess(session: Awaited<ReturnType<typeof requireSessionAction>>): void {
  if (!canAccessOperationalCatalog(session)) {
    throw new Error("Você não tem permissão para acessar clientes.");
  }
}

export async function createClientAction(input: {
  name: string;
  email: string;
  phone: string;
  birthDate?: string;
  status?: "Ativo" | "Inativo";
}): Promise<ActionResult<ClientProps>> {
  try {
    const session = await requireSessionAction();
    requireClientAccess(session);
    const useCase = createClient;
    const created = await useCase.execute(input);
    return { success: true, data: sanitizeClient(created.toJSON(), session) };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao cadastrar cliente.") };
  }
}

export async function updateClientAction(input: {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  status?: "Ativo" | "Inativo";
}): Promise<ActionResult<ClientProps>> {
  try {
    const session = await requireSessionAction();
    requireClientAccess(session);
    const useCase = updateClient;
    const updated = await useCase.execute(input);
    return { success: true, data: sanitizeClient(updated.toJSON(), session) };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao atualizar cliente.") };
  }
}

export async function deleteClientAction(id: string): Promise<ActionResult<void>> {
  try {
    const session = await requireSessionAction();
    requireClientAccess(session);
    const useCase = deleteClient;
    await useCase.execute(id);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao excluir cliente.") };
  }
}
