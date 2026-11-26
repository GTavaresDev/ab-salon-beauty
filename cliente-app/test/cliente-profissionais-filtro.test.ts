import { describe, expect, it } from "vitest";
import { isPublicBookableProfessional } from "@core/application/query/gateway/professional.gateway";

describe("Filtro de profissionais para clientes", () => {
  it("não expõe 'Product Manegar' nem 'Administrador' nem papéis de gestão/admin", () => {
    const list = [
      { id: "1", name: "Product Manegar", initials: "PM" },
      { id: "2", name: "product manegar", initials: "PM" },
      { id: "3", name: "Administrador", initials: "AD" },
      { id: "4", name: "Mariana Costa", initials: "MC", role: "Funcionario" as const },
      { id: "5", name: "Gabriel Cabeleireiro", initials: "GC" },
      { id: "6", name: "Chefe Oculto", initials: "CO", role: "Administrador" as const },
      { id: "7", name: "Proprietário", initials: "PR", role: "Dono" as const },
    ];

    const gatewayExposed = list.map((p) => ({ ...p, role: p.role as any })).filter(isPublicBookableProfessional);
    expect(gatewayExposed.map((p) => p.name)).toEqual(["Mariana Costa", "Gabriel Cabeleireiro"]);
  });
});
