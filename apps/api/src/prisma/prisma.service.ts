import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client.js';

function positiveInteger(
  value: string | undefined,
  fallback: number,
) {
  if (!value) {
    return fallback;
  }

  const parsed =
    Number.parseInt(
      value,
      10,
    );

  if (
    !Number.isFinite(
      parsed,
    ) ||
    parsed <= 0
  ) {
    return fallback;
  }

  return parsed;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements
    OnModuleInit,
    OnModuleDestroy
{
  constructor() {
    const databaseUrl =
      process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL environment variable is not defined.',
      );
    }

    /*
     * Prisma ORM 7 + @prisma/adapter-pg uses node-postgres pooling.
     *
     * Production/serverless gets a deliberately smaller per-instance
     * pool so horizontally scaled instances do not overwhelm Postgres.
     * Local development keeps a slightly larger pool for parallel work.
     *
     * Override with DATABASE_POOL_MAX when your deployment requires
     * a different value.
     */
    const defaultPoolMax =
      process.env.NODE_ENV ===
      'production'
        ? 5
        : 10;

    const poolMax =
      positiveInteger(
        process.env
          .DATABASE_POOL_MAX,
        defaultPoolMax,
      );

    const adapter =
      new PrismaPg({
        connectionString:
          databaseUrl,

        max:
          poolMax,

        connectionTimeoutMillis:
          5_000,

        idleTimeoutMillis:
          10_000,

        maxLifetimeSeconds:
          300,
      });

    super({
      adapter,
    });
  }

  async onModuleInit(): Promise<void> {
    /*
     * Warm the database connection when Nest starts instead of making
     * the first real user request pay the full connection setup cost.
     */
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
