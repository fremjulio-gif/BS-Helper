import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null;
};

export const isPostgresConfigured = Boolean(
  process.env.DATABASE_URL &&
    (process.env.DATABASE_URL.startsWith('postgres://') ||
      process.env.DATABASE_URL.startsWith('postgresql://'))
);

function createPrismaClient(): PrismaClient | null {
  if (!isPostgresConfigured) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[Prisma] DATABASE_URL n\'est pas encore configurée avec une URL Neon PostgreSQL valide. En attente de configuration dans .env.local.'
      );
    }
    return null;
  }

  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  } catch (err) {
    console.error('[Prisma] Erreur initialisation PrismaClient:', err);
    return null;
  }
}

export const prisma = globalForPrisma.prisma !== undefined
  ? globalForPrisma.prisma
  : createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
