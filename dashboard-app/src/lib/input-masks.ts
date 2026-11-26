/** Mantém apenas dígitos, com limite opcional. */
export function digitsOnly(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, "");
  if (typeof maxLength === "number") {
    return digits.slice(0, maxLength);
  }
  return digits;
}
/**
 * Telefone BR: (62) 99427-9139 (celular) ou (62) 3333-4444 (fix).
 * Aceita somente dígitos na entrada.
 */
export function formatPhoneBR(value: string): string {
  const digits = digitsOnly(value, 11);

  if (digits.length === 0) {
    return "";
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);

  if (digits.length <= 6) {
    return `(${ddd}) ${rest}`;
  }

  if (digits.length <= 10) {
    return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }

  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}
