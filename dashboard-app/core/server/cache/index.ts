// Interface mantida para os repositórios; as leituras consultam sempre o banco.
export const CacheTTL = {
  clients: 300,
  products: 300,
  users: 300,
  services: 600,
  reports: 1200,
} as const;

function slug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const CacheKeys = {
  clients: "clients:all",
  products: "products:all",
  users: "users:all",
  services: "services:all",
  servicesActive: "services:active",
  reports: (period: string) => `reports:metrics:${slug(period)}`,
} as const;

export async function getCached<T>(
  _key: string,
  _ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  return loader();
}

export async function invalidate(..._keys: string[]): Promise<void> {}
