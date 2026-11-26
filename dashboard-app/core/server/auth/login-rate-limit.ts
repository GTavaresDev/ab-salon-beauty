import { createHash } from "node:crypto";

const windowSeconds = 15 * 60;
const maxAttempts = 10;
const local = new Map<string, number>();
let localWindow = 0;

export async function allowLoginAttempt(email: string, now = Date.now()): Promise<boolean> {
  const window = Math.floor(now / (windowSeconds * 1000));
  const digest = createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
  if (localWindow !== window) {
    local.clear();
    localWindow = window;
  }
  const attempts = (local.get(digest) ?? 0) + 1;
  local.set(digest, attempts);
  return attempts <= maxAttempts;
}
