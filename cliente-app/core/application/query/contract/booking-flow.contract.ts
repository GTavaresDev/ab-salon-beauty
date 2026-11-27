import type { BookableServiceDTO } from "./service.contract";
import type { BookableProfessionalDTO } from "./professional.contract";

export type BookingAvailability = Record<number, Record<string, string[]>>;

export type BookingFlowResponse = {
  catalog: Array<{
    serviceId: string;
    serviceName: string;
    description: string | null;
    duration: number;
    professionalId: string;
    professionalName: string;
    initials: string;
  }>;
  availability: BookingAvailability;
};

export type BookingService = BookableServiceDTO & {
  professionals: BookableProfessionalDTO[];
};

export type BookingFlow = {
  services: BookingService[];
  availability: BookingAvailability;
};
