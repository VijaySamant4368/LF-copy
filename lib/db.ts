// Singleton pg Pool. Cached on globalThis in dev so Next.js HMR doesn't open a
// fresh pool (and exhaust Postgres connections) on every module reload.
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set (see lawsforum-web/.env.local)");
  }
  // `next build` runs static generation across several worker processes, each
  // with its own Pool instance (globalThis caching only helps within one process).
  // Keep per-pool max low so N workers together stay well under Postgres's
  // max_connections — a single worker generating one page at a time never
  // needs more than a couple of connections anyway.
  return new Pool({ connectionString, max: 4, idleTimeoutMillis: 10_000 });
}

export const pool = globalThis.__pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalThis.__pgPool = pool;
}

export function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params?: unknown[]
) {
  return pool.query<T>(text, params);
}
