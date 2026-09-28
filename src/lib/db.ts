import { PrismaClient } from "@prisma/client";

// One shared database connection. In dev, Next.js reloads files a lot —
// stashing the client on globalThis stops it from opening a new connection each time.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
