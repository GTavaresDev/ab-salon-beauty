import { config } from "dotenv";
import { resolve } from "node:path";
import type { NextConfig } from "next";

// The shared Neon environment lives at the Turborepo root and must take
// precedence over a shell variable or the legacy workspace .env database URL.
config({ path: resolve(process.cwd(), "..", ".env.local"), override: true });

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
