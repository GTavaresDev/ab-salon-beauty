import type { Service } from "@/types/service.type";
import { SERVICES_DATA } from "@/data/services";

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function getServices(): Promise<Service[]> {
  return SERVICES_DATA;
}

export async function getFeaturedServices(limit = 6): Promise<Service[]> {
  const services = await getServices();
  const ranked = [...services].sort((a, b) => {
    const aScore = normalizeText(a.title).includes("sobrancelhas") ? 1 : 0;
    const bScore = normalizeText(b.title).includes("sobrancelhas") ? 1 : 0;
    return bScore - aScore;
  });

  return ranked.slice(0, limit);
}
