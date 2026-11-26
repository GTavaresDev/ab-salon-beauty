export const userPasswordRequirements = [
  { id: "length", label: "Pelo menos 10 caracteres", test: (password: string) => password.length >= 10 },
  { id: "uppercase", label: "Pelo menos 1 letra maiúscula", test: (password: string) => /[A-Z]/.test(password) },
  { id: "number", label: "Pelo menos 1 número", test: (password: string) => /\d/.test(password) },
  { id: "special", label: "Pelo menos 1 caractere especial", test: (password: string) => /[^A-Za-z0-9\s]/.test(password) },
] as const;

export function getUserPasswordRequirements(password: string) {
  return userPasswordRequirements.map((requirement) => ({
    ...requirement,
    met: requirement.test(password),
  }));
}

export function isValidUserPassword(password: string): boolean {
  return getUserPasswordRequirements(password).every((requirement) => requirement.met);
}

export const userPasswordPolicyMessage =
  "A senha deve ter pelo menos 10 caracteres, uma letra maiúscula, um número e um caractere especial.";
