export type BookableProfessionalDTO = {
  id: string;
  name: string;
  initials: string;
  role?: "Dono" | "Administrador" | "Gestor" | "Funcionario";
};
