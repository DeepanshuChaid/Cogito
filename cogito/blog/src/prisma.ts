import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';

import ws from 'ws';
neonConfig.webSocketConstructor = ws;

// ---- FIX: Add global type declaration ----
declare global {
  // Allow global caching of PrismaClient in dev
  // Add PrismaClient type so TS stops complaining
  // eslint-disable-next-line no-var
  var prisma: InstanceType<typeof PrismaClient> | undefined;
}
// ------------------------------------------

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaNeon({ connectionString });

const prisma =
  globalThis.prisma ||
  new PrismaClient({
    adapter,
  });

// cache only in dev mode (prevents hot-reload multiple instances)
if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = prisma;
}

export default prisma;



