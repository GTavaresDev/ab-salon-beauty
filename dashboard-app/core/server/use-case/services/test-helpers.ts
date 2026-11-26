import { vi, type Mocked } from "vitest";
import { Service, type ServiceProps } from "@core/application/query/interface/service.entity";
import type { ServiceRepository } from "@core/server/db/repository/service.repository";

export function buildService(overrides: Partial<ServiceProps> = {}): Service {
  return new Service({
    id: "sv1",
    name: "Corte",
    duration: 30,
    price: 50,
    ...overrides,
  });
}

export function mockServiceRepository(): Mocked<ServiceRepository> {
  return {
    save: vi.fn(),
    findById: vi.fn(),
    findByName: vi.fn(),
    findAll: vi.fn(),
    findActive: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as Mocked<ServiceRepository>;
}
