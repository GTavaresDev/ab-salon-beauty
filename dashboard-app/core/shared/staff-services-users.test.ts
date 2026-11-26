import { describe, expect, it } from "vitest";
import type { UserProps } from "@core/application/query/interface/user.entity";
import { listStaffUsers } from "./staff-services-users";

function user(id: string, name: string, serviceIds: string[]): UserProps {
  return { id, name, email: id + "@example.com", phone: "", role: "Funcionario", status: "Ativo", initials: "GT", serviceIds };
}

describe("listStaffUsers", () => {
  it("keeps different accounts with the same name separate", () => {
    const result = listStaffUsers([
      user("u1", "Gabriel Tavares", ["srv-1"]),
      user("u2", "Gabriel Tavares", ["srv-2"]),
      user("u3", "Mariana Costa", []),
    ]);
    expect(result).toHaveLength(3);
    expect(result.map((employee) => employee.id)).toEqual(["u1", "u2", "u3"]);
    expect(result.map((employee) => employee.serviceIds)).toEqual([["srv-1"], ["srv-2"], []]);
  });

  it("deduplicates only repeated rows with the same user id", () => {
    expect(listStaffUsers([user("u1", "Ana", []), user("u1", "Ana", [])])).toHaveLength(1);
  });
});
