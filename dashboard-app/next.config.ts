import { config } from "dotenv";
import { resolve } from "node:path";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// The shared Neon environment lives at the Turborepo root and must take
// precedence over a shell variable or the legacy workspace .env database URL.
config({ path: resolve(process.cwd(), "..", ".env.local"), override: true });

export default function nextConfig(phase: string): NextConfig {
  const pageExtensions = ["tsx", "ts", "jsx", "js"];
  if (phase === PHASE_DEVELOPMENT_SERVER) pageExtensions.unshift("dev.tsx");

  return { reactCompiler: true, pageExtensions };
}
