/**
 * lib/prisma.ts — Singleton PrismaClient for Next.js / serverless environments.
 *
 * In development, Next.js hot-reload creates new module instances on each reload.
 * Without this pattern, each reload would open a new DB connection pool, exhausting
 * the connection limit quickly. We store a single instance on the global object and
 * reuse it across reloads.
 *
 * In production (Vercel serverless), each function invocation gets a fresh process,
 * so the global trick is not needed — but it's harmless.
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
