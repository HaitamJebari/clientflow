import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import {
  PrismaClient,
} from './dist/generated/prisma/client.js';

const databaseUrl =
  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is missing.',
  );
}

const prisma =
  new PrismaClient({
    adapter:
      new PrismaPg({
        connectionString:
          databaseUrl,
      }),
  });

console.log(
  'followUp delegate type:',
  typeof prisma.followUp,
);

console.log(
  'model delegates:',
  Object.keys(prisma).filter(
    (key) =>
      !key.startsWith('$') &&
      !key.startsWith('_'),
  ),
);

await prisma.$disconnect();