"use server";

import { z } from "zod";
import { getAvailableDatesGateway, getAvailableTimesGateway } from "@core/application/query/gateway/date.gateway";
import { requireClientSession } from "@/lib/client-session";

const idSchema = z.string().trim().min(1).max(64);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export async function getAvailableDatesAction(serviceId: string): Promise<string[]> {
  await requireClientSession();
  if (!idSchema.safeParse(serviceId).success) return [];
  const result = await getAvailableDatesGateway(serviceId);
  return result.tag === "right" ? result.value : [];
}

export async function getAvailableTimesAction(serviceId: string, date: string): Promise<string[]> {
  await requireClientSession();
  if (!idSchema.safeParse(serviceId).success || !dateSchema.safeParse(date).success) return [];
  const result = await getAvailableTimesGateway(serviceId, date);
  return result.tag === "right" ? result.value : [];
}
