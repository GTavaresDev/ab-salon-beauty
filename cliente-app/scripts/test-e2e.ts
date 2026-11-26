import { spawn, spawnSync } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import { rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.E2E_DATABASE_URL;

if (!databaseUrl) {
  throw new Error("E2E_DATABASE_URL é obrigatório para os testes E2E.");
}

if (process.env.E2E_ALLOW_DATABASE_WRITES !== "true") {
  throw new Error(
    "Os testes E2E gravam e removem fixtures. Aponte E2E_DATABASE_URL para uma cópia local e defina E2E_ALLOW_DATABASE_WRITES=true.",
  );
}

const fixturesFile = path.join(os.tmpdir(), `agendamentos-e2e-${randomUUID()}.json`);
const namespace = randomUUID();
const fixtureManifest = {
  namespace,
  adminEmail: `admin-${namespace}@agendamentos.test`,
  clientEmail: `client-${namespace}@agendamentos.test`,
  professionalEmail: `professional-${namespace}@agendamentos.test`,
  serviceName: `Consulta E2E ${namespace}`,
  appointmentId: randomUUID(),
};
writeFileSync(fixturesFile, JSON.stringify(fixtureManifest));
const testEnv: NodeJS.ProcessEnv = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  AUTH_SECRET:
    process.env.AUTH_SECRET || "e2e-only-secret-that-must-not-be-used-in-production",
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID || "e2e-test-client",
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET || "e2e-test-secret",
  APP_URL: process.env.APP_URL || "http://127.0.0.1:3100",
  NODE_ENV: "development",
  E2E_ALLOW_DATABASE_WRITES: "true",
  E2E_FIXTURES_FILE: fixturesFile,
  E2E_TEST_NAMESPACE: namespace,
};

function run(command: string, args: string[]): Promise<number> {
  return new Promise((resolve, reject) => {
    const child: ChildProcess = spawn(command, args, {
      cwd: process.cwd(),
      stdio: "inherit",
      env: testEnv,
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code !== null) resolve(code);
      else reject(new Error(`${command} terminated by ${signal ?? "unknown signal"}.`));
    });
  });
}

async function main() {
  try {
    const seedExitCode = await run("npx", ["tsx", "scripts/test-support/seed-e2e.ts"]);
    if (seedExitCode !== 0) throw new Error(`E2E seed failed with code ${seedExitCode}.`);
    process.exitCode = await run("npx", ["playwright", "test"]);
  } finally {
    const cleanup = spawnSync("npx", ["tsx", "scripts/test-support/cleanup-e2e.ts"], {
      cwd: process.cwd(),
      stdio: "inherit",
      env: testEnv,
    });
    if (cleanup.status !== 0) process.exitCode ||= cleanup.status ?? 1;
    rmSync(fixturesFile, { force: true });
  }
}

main().catch((error) => {
  console.error("Could not run E2E tests.", error);
  process.exitCode = 1;
});
