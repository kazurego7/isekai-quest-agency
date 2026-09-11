import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
const databaseUrl = process.env.DATABASE_URL;
const cachedPrisma = globalForPrisma.prismaDatabaseUrl === databaseUrl ? globalForPrisma.prisma : null;
if (globalForPrisma.prisma && !cachedPrisma) {
  // Next.js can reload .env.local without restarting its development process.
  void globalForPrisma.prisma.$disconnect();
}

const prisma =
  cachedPrisma ??
  new PrismaClient({
    datasourceUrl: databaseUrl,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaDatabaseUrl = databaseUrl;
}

export default prisma;
