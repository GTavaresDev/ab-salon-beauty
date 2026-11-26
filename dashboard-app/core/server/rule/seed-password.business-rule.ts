export function requireSeedPassword(
  env: Record<string, string | undefined>,
  name: string,
): string {
  const password = env[name];
  if (!password || password.length < 16) {
    throw new Error(`${name} é obrigatória e deve ter pelo menos 16 caracteres.`);
  }
  return password;
}

export function requireSeedPasswords(
  env: Record<string, string | undefined>,
  names: readonly string[],
): Record<string, string> {
  return Object.fromEntries(names.map((name) => [name, requireSeedPassword(env, name)]));
}
