import 'dotenv/config';

import {
  randomUUID,
} from 'node:crypto';

import {
  PrismaPg,
} from '@prisma/adapter-pg';

import prismaClientModule from '../dist/generated/prisma/client.js';

const {
  PrismaClient,
} = prismaClientModule;

const databaseUrl =
  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL environment variable is not defined.',
  );
}

const adapter =
  new PrismaPg({
    connectionString:
      databaseUrl,

    max: 5,
  });

const prisma =
  new PrismaClient({
    adapter,
  });

function normalizeEmail(
  value,
) {
  const normalized =
    value
      ?.trim()
      .toLowerCase();

  return normalized || null;
}

function normalizePhone(
  value,
) {
  const normalized =
    value
      ?.replace(
        /\s+/g,
        '',
      )
      .trim();

  return normalized || null;
}

function identityKey(
  lead,
) {
  const email =
    normalizeEmail(
      lead.email,
    );

  if (email) {
    return `email:${email}`;
  }

  const phone =
    normalizePhone(
      lead.phone,
    );

  if (phone) {
    return `phone:${phone}`;
  }

  return `lead:${lead.id}`;
}

function activityTime(
  lead,
) {
  return (
    lead.lastActivityAt ??
    lead.updatedAt ??
    lead.createdAt
  ).getTime();
}

async function main() {
  console.log(
    'Loading existing leads...',
  );

  const leads =
    await prisma.lead.findMany({
      orderBy: {
        createdAt:
          'asc',
      },

      select: {
        id: true,
        organizationId: true,
        contactId: true,

        firstName: true,
        lastName: true,

        email: true,
        phone: true,

        company: true,
        jobTitle: true,
        website: true,

        source: true,

        lastActivityAt: true,

        createdAt: true,
        updatedAt: true,
      },
    });

  if (
    leads.length === 0
  ) {
    console.log(
      'No leads found. Nothing to backfill.',
    );

    return;
  }

  const groups =
    new Map();

  for (
    const lead of leads
  ) {
    const key =
      identityKey(
        lead,
      );

    const mapKey =
      `${lead.organizationId}::${key}`;

    const existing =
      groups.get(
        mapKey,
      );

    if (!existing) {
      groups.set(
        mapKey,
        {
          organizationId:
            lead.organizationId,

          identityKey:
            key,

          representative:
            lead,

          leadIds: [
            lead.id,
          ],
        },
      );

      continue;
    }

    existing.leadIds.push(
      lead.id,
    );

    if (
      activityTime(lead) >
      activityTime(
        existing.representative,
      )
    ) {
      existing.representative =
        lead;
    }
  }

  const contactGroups =
    Array.from(
      groups.values(),
    );

  console.log(
    `Found ${leads.length} leads across ${contactGroups.length} contact identities.`,
  );

  const concurrency =
    20;

  let linkedLeads = 0;

  for (
    let index = 0;
    index <
    contactGroups.length;
    index += concurrency
  ) {
    const batch =
      contactGroups.slice(
        index,
        index +
          concurrency,
      );

    await Promise.all(
      batch.map(
        async (group) => {
          const lead =
            group.representative;

          const contact =
            await prisma.contact.upsert({
              where: {
                organizationId_identityKey: {
                  organizationId:
                    group.organizationId,

                  identityKey:
                    group.identityKey,
                },
              },

              create: {
                id:
                  randomUUID(),

                organizationId:
                  group.organizationId,

                identityKey:
                  group.identityKey,

                firstName:
                  lead.firstName,

                lastName:
                  lead.lastName,

                email:
                  lead.email,

                phone:
                  lead.phone,

                company:
                  lead.company,

                jobTitle:
                  lead.jobTitle,

                website:
                  lead.website,

                source:
                  lead.source,
              },

              update: {
                firstName:
                  lead.firstName,

                lastName:
                  lead.lastName,

                email:
                  lead.email,

                phone:
                  lead.phone,

                company:
                  lead.company,

                jobTitle:
                  lead.jobTitle,

                website:
                  lead.website,

                source:
                  lead.source,
              },

              select: {
                id: true,
              },
            });

          const result =
            await prisma.lead.updateMany({
              where: {
                organizationId:
                  group.organizationId,

                id: {
                  in:
                    group.leadIds,
                },
              },

              data: {
                contactId:
                  contact.id,
              },
            });

          linkedLeads +=
            result.count;
        },
      ),
    );

    console.log(
      `Processed ${Math.min(
        index + concurrency,
        contactGroups.length,
      )}/${contactGroups.length} contacts...`,
    );
  }

  console.log(
    `Backfill complete. ${linkedLeads} lead records were linked or confirmed against contacts.`,
  );
}

main()
  .catch(
    (error) => {
      console.error(
        'Contact backfill failed:',
        error,
      );

      process.exitCode =
        1;
    },
  )
  .finally(
    async () => {
      await prisma.$disconnect();
    },
  );