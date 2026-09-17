import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  randomUUID,
} from 'node:crypto';

import {
  LeadStage,
  LeadTemperature,
} from '../../generated/prisma/enums';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateLeadDto } from './dto/create-lead.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';
import { QueryPipelineDto } from './dto/query-pipeline.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

const leadListSelect = {
  id: true,

  firstName: true,
  lastName: true,

  email: true,
  phone: true,

  company: true,
  jobTitle: true,
  website: true,

  source: true,

  stage: true,
  temperature: true,
  qualification: true,

  valueCents: true,
  currency: true,

  notes: true,

  lastActivityAt: true,
  lastContactedAt: true,
  nextFollowUpAt: true,

  aiSummary: true,
  aiNextBestAction: true,

  createdAt: true,
  updatedAt: true,
} as const;

const pipelineLeadSelect = {
  id: true,

  firstName: true,
  lastName: true,

  email: true,

  company: true,
  jobTitle: true,

  source: true,

  stage: true,
  temperature: true,
  qualification: true,

  valueCents: true,
  currency: true,

  lastActivityAt: true,
  nextFollowUpAt: true,

  aiNextBestAction: true,

  createdAt: true,
  updatedAt: true,
} as const;

const pipelineStages = [
  LeadStage.NEW,
  LeadStage.CONTACTED,
  LeadStage.QUALIFIED,
  LeadStage.PROPOSAL,
  LeadStage.NEGOTIATION,
  LeadStage.WON,
  LeadStage.LOST,
] as const;


function normalizeContactEmail(
  value:
    | string
    | null
    | undefined,
) {
  const normalized =
    value
      ?.trim()
      .toLowerCase();

  return normalized || null;
}

function normalizeContactPhone(
  value:
    | string
    | null
    | undefined,
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

function contactIdentityKey(
  email:
    | string
    | null
    | undefined,

  phone:
    | string
    | null
    | undefined,

  leadId: string,
) {
  const normalizedEmail =
    normalizeContactEmail(
      email,
    );

  if (normalizedEmail) {
    return `email:${normalizedEmail}`;
  }

  const normalizedPhone =
    normalizeContactPhone(
      phone,
    );

  if (normalizedPhone) {
    return `phone:${normalizedPhone}`;
  }

  return `lead:${leadId}`;
}

interface LeadSummaryRow {
  activeCount: number;
  attentionCount: number;
  potentialValueCents: number;
}

interface PipelineStageStatRow {
  stage: LeadStage;
  count: number;
  totalValueCents: number;
}

interface PipelineLeadRow {
  id: string;

  firstName: string;
  lastName: string | null;

  email: string | null;

  company: string | null;
  jobTitle: string | null;

  source: string | null;

  stage: LeadStage;

  temperature:
    | LeadTemperature
    | null;

  qualification:
    | 'UNASSESSED'
    | 'STRONG_FIT'
    | 'GOOD_FIT'
    | 'WEAK_FIT'
    | 'UNQUALIFIED';

  valueCents: number | null;
  currency: string;

  lastActivityAt: Date | null;
  nextFollowUpAt: Date | null;

  aiNextBestAction: string | null;

  createdAt: Date;
  updatedAt: Date;

  pipelineRank: number;
}

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private buildSearchWhere(
    search: string,
  ) {
    if (!search) {
      return {};
    }

    return {
      OR: [
        {
          firstName: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          lastName: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          phone: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          company: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          jobTitle: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          source: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
      ],
    };
  }

  async create(
    organizationId: string,
    dto: CreateLeadDto,
  ) {
    const leadId =
      randomUUID();

    const identityKey =
      contactIdentityKey(
        dto.email,
        dto.phone,
        leadId,
      );

    return this.prisma.$transaction(
      async (tx) => {
        const contact =
          await tx.contact.upsert({
            where: {
              organizationId_identityKey: {
                organizationId,
                identityKey,
              },
            },

            create: {
              organizationId,
              identityKey,

              firstName:
                dto.firstName,

              lastName:
                dto.lastName,

              email:
                dto.email,

              phone:
                dto.phone,

              company:
                dto.company,

              jobTitle:
                dto.jobTitle,

              website:
                dto.website,

              source:
                dto.source,
            },

            update: {
              firstName:
                dto.firstName,

              ...(dto.lastName !==
                undefined && {
                lastName:
                  dto.lastName,
              }),

              ...(dto.email !==
                undefined && {
                email:
                  dto.email,
              }),

              ...(dto.phone !==
                undefined && {
                phone:
                  dto.phone,
              }),

              ...(dto.company !==
                undefined && {
                company:
                  dto.company,
              }),

              ...(dto.jobTitle !==
                undefined && {
                jobTitle:
                  dto.jobTitle,
              }),

              ...(dto.website !==
                undefined && {
                website:
                  dto.website,
              }),

              ...(dto.source !==
                undefined && {
                source:
                  dto.source,
              }),
            },

            select: {
              id: true,
            },
          });

        return tx.lead.create({
          data: {
            id:
              leadId,

            organizationId,

            contactId:
              contact.id,

            ...dto,

            currency:
              dto.currency
                ?.toUpperCase() ??
              'EUR',
          },
        });
      },
    );
  }

  async findAll(
    organizationId: string,
    query: QueryLeadsDto,
  ) {
    const search =
      query.search?.trim() ?? '';

    const filter =
      query.filter ?? 'all';

    const sort =
      query.sort ?? 'priority';

    const page =
      query.page ?? 1;

    const pageSize =
      query.pageSize ?? 20;

    const skip =
      (page - 1) * pageSize;

    const now =
      new Date();

    const searchWhere =
      this.buildSearchWhere(
        search,
      );

    const where = {
      organizationId,

      ...searchWhere,

      ...(filter === 'hot'
        ? {
            temperature:
              LeadTemperature.HOT,
          }
        : {}),

      ...(filter === 'warm'
        ? {
            temperature:
              LeadTemperature.WARM,
          }
        : {}),

      ...(filter === 'attention'
        ? {
            AND: [
              {
                stage: {
                  notIn: [
                    LeadStage.WON,
                    LeadStage.LOST,
                  ],
                },
              },
              {
                OR: [
                  {
                    temperature:
                      LeadTemperature.HOT,
                  },
                  {
                    nextFollowUpAt: {
                      lte: now,
                    },
                  },
                ],
              },
            ],
          }
        : {}),
    };

    const orderBy =
      sort === 'value-high'
        ? [
            {
              valueCents:
                'desc' as const,
            },
            {
              createdAt:
                'desc' as const,
            },
          ]
        : sort === 'value-low'
          ? [
              {
                valueCents:
                  'asc' as const,
              },
              {
                createdAt:
                  'desc' as const,
              },
            ]
          : sort === 'company'
            ? [
                {
                  company:
                    'asc' as const,
                },
                {
                  lastName:
                    'asc' as const,
                },
                {
                  firstName:
                    'asc' as const,
                },
              ]
            : [
                {
                  nextFollowUpAt:
                    'asc' as const,
                },
                {
                  updatedAt:
                    'desc' as const,
                },
              ];

    /*
     * Keep the list request focused:
     * - one paginated data query
     * - one filtered count query
     *
     * Organization-wide summary numbers live in a separate endpoint,
     * so typing in search does not repeatedly recalculate the same KPIs.
     */
    const [
      leads,
      total,
    ] =
      await Promise.all([
        this.prisma.lead.findMany({
          where,
          orderBy,
          skip,
          take: pageSize,
          select: leadListSelect,
        }),

        this.prisma.lead.count({
          where,
        }),
      ]);

    const totalPages =
      Math.max(
        1,
        Math.ceil(total / pageSize),
      );

    return {
      data: leads,

      meta: {
        page,
        pageSize,
        total,
        totalPages,
        hasPreviousPage:
          page > 1,
        hasNextPage:
          page < totalPages,
      },
    };
  }

  async getSummary(
    organizationId: string,
  ) {
    /*
     * One PostgreSQL aggregate query replaces three independent
     * count/sum queries.
     */
    const rows =
      await this.prisma.$queryRawUnsafe<
        LeadSummaryRow[]
      >(
        `
          SELECT
            COUNT(*) FILTER (
              WHERE "stage" NOT IN ('WON', 'LOST')
            )::int AS "activeCount",

            COUNT(*) FILTER (
              WHERE
                "stage" NOT IN ('WON', 'LOST')
                AND (
                  "temperature" = 'HOT'
                  OR (
                    "nextFollowUpAt" IS NOT NULL
                    AND "nextFollowUpAt" <= NOW()
                  )
                )
            )::int AS "attentionCount",

            COALESCE(
              SUM("valueCents") FILTER (
                WHERE "stage" NOT IN ('WON', 'LOST')
              ),
              0
            )::double precision AS "potentialValueCents"

          FROM "leads"

          WHERE "organizationId" = $1
        `,
        organizationId,
      );

    const summary =
      rows[0] ?? {
        activeCount: 0,
        attentionCount: 0,
        potentialValueCents: 0,
      };

    return {
      activeCount:
        Number(
          summary.activeCount,
        ),

      attentionCount:
        Number(
          summary.attentionCount,
        ),

      potentialValueCents:
        Number(
          summary.potentialValueCents,
        ),

      currency: 'EUR',
    };
  }

  async findPipelineBoard(
    organizationId: string,
    query: QueryPipelineDto,
  ) {
    const search =
      query.search?.trim() ?? '';

    const limitPerStage =
      query.limitPerStage ?? 20;

    /*
     * This endpoint is intentionally optimized for the Kanban board:
     *
     * 1) one GROUP BY query for the real stage counts/value totals
     * 2) one PostgreSQL window-function query that returns only the
     *    top N cards from EACH stage
     *
     * That replaces the previous 1 + 7-query approach.
     */
    let stageStats:
      PipelineStageStatRow[];

    let pipelineRows:
      PipelineLeadRow[];

    if (search) {
      const searchPattern =
        `%${search}%`;

      [
        stageStats,
        pipelineRows,
      ] =
        await Promise.all([
          this.prisma.$queryRawUnsafe<
            PipelineStageStatRow[]
          >(
            `
              SELECT
                "stage"::text AS "stage",
                COUNT(*)::int AS "count",
                COALESCE(
                  SUM("valueCents"),
                  0
                )::double precision AS "totalValueCents"

              FROM "leads"

              WHERE
                "organizationId" = $1
                AND (
                  "firstName" ILIKE $2
                  OR "lastName" ILIKE $2
                  OR "email" ILIKE $2
                  OR "phone" ILIKE $2
                  OR "company" ILIKE $2
                  OR "jobTitle" ILIKE $2
                  OR "source" ILIKE $2
                )

              GROUP BY "stage"
            `,
            organizationId,
            searchPattern,
          ),

          this.prisma.$queryRawUnsafe<
            PipelineLeadRow[]
          >(
            `
              WITH ranked AS (
                SELECT
                  "id",
                  "firstName",
                  "lastName",
                  "email",
                  "company",
                  "jobTitle",
                  "source",

                  "stage",
                  "temperature",
                  "qualification",

                  "valueCents",
                  "currency",

                  "lastActivityAt",
                  "nextFollowUpAt",

                  "aiNextBestAction",

                  "createdAt",
                  "updatedAt",

                  ROW_NUMBER() OVER (
                    PARTITION BY "stage"
                    ORDER BY
                      "valueCents" DESC NULLS LAST,
                      "updatedAt" DESC
                  )::int AS "pipelineRank"

                FROM "leads"

                WHERE
                  "organizationId" = $1
                  AND (
                    "firstName" ILIKE $2
                    OR "lastName" ILIKE $2
                    OR "email" ILIKE $2
                    OR "phone" ILIKE $2
                    OR "company" ILIKE $2
                    OR "jobTitle" ILIKE $2
                    OR "source" ILIKE $2
                  )
              )

              SELECT *
              FROM ranked

              WHERE "pipelineRank" <= $3

              ORDER BY
                "stage",
                "pipelineRank"
            `,
            organizationId,
            searchPattern,
            limitPerStage,
          ),
        ]);
    } else {
      [
        stageStats,
        pipelineRows,
      ] =
        await Promise.all([
          this.prisma.$queryRawUnsafe<
            PipelineStageStatRow[]
          >(
            `
              SELECT
                "stage"::text AS "stage",
                COUNT(*)::int AS "count",
                COALESCE(
                  SUM("valueCents"),
                  0
                )::double precision AS "totalValueCents"

              FROM "leads"

              WHERE
                "organizationId" = $1

              GROUP BY "stage"
            `,
            organizationId,
          ),

          this.prisma.$queryRawUnsafe<
            PipelineLeadRow[]
          >(
            `
              WITH ranked AS (
                SELECT
                  "id",
                  "firstName",
                  "lastName",
                  "email",
                  "company",
                  "jobTitle",
                  "source",

                  "stage",
                  "temperature",
                  "qualification",

                  "valueCents",
                  "currency",

                  "lastActivityAt",
                  "nextFollowUpAt",

                  "aiNextBestAction",

                  "createdAt",
                  "updatedAt",

                  ROW_NUMBER() OVER (
                    PARTITION BY "stage"
                    ORDER BY
                      "valueCents" DESC NULLS LAST,
                      "updatedAt" DESC
                  )::int AS "pipelineRank"

                FROM "leads"

                WHERE
                  "organizationId" = $1
              )

              SELECT *
              FROM ranked

              WHERE "pipelineRank" <= $2

              ORDER BY
                "stage",
                "pipelineRank"
            `,
            organizationId,
            limitPerStage,
          ),
        ]);
    }

    const statsByStage =
      new Map(
        stageStats.map(
          (item) => [
            item.stage,
            {
              count:
                Number(
                  item.count,
                ),

              totalValueCents:
                Number(
                  item.totalValueCents,
                ),
            },
          ],
        ),
      );

    const rowsByStage =
      new Map<
        LeadStage,
        PipelineLeadRow[]
      >();

    for (
      const stage of
      pipelineStages
    ) {
      rowsByStage.set(
        stage,
        [],
      );
    }

    for (
      const row of
      pipelineRows
    ) {
      const bucket =
        rowsByStage.get(
          row.stage,
        );

      if (bucket) {
        bucket.push(
          row,
        );
      }
    }

    const getStats = (
      stage: LeadStage,
    ) =>
      statsByStage.get(
        stage,
      ) ?? {
        count: 0,
        totalValueCents: 0,
      };

    const openStages = [
      LeadStage.NEW,
      LeadStage.CONTACTED,
      LeadStage.QUALIFIED,
      LeadStage.PROPOSAL,
      LeadStage.NEGOTIATION,
    ];

    const openCount =
      openStages.reduce(
        (
          total,
          stage,
        ) =>
          total +
          getStats(stage)
            .count,
        0,
      );

    const openValueCents =
      openStages.reduce(
        (
          total,
          stage,
        ) =>
          total +
          getStats(stage)
            .totalValueCents,
        0,
      );

    const wonStats =
      getStats(
        LeadStage.WON,
      );

    const lostStats =
      getStats(
        LeadStage.LOST,
      );

    const visibleCount =
      openCount +
      wonStats.count;

    const columns =
      pipelineStages
        .filter(
          (stage) =>
            stage !==
            LeadStage.LOST,
        )
        .map(
          (stage) => {
            const stats =
              getStats(
                stage,
              );

            const data =
              rowsByStage.get(
                stage,
              ) ?? [];

            return {
              stage,

              count:
                stats.count,

              totalValueCents:
                stats.totalValueCents,

              hasMore:
                stats.count >
                data.length,

              data,
            };
          },
        );

    const lostData =
      rowsByStage.get(
        LeadStage.LOST,
      ) ?? [];

    return {
      summary: {
        visibleCount,
        openCount,
        openValueCents,

        wonCount:
          wonStats.count,

        wonValueCents:
          wonStats.totalValueCents,

        lostCount:
          lostStats.count,

        currency: 'EUR',
      },

      columns,

      lost: {
        stage:
          LeadStage.LOST,

        count:
          lostStats.count,

        totalValueCents:
          lostStats.totalValueCents,

        hasMore:
          lostStats.count >
          lostData.length,

        data:
          lostData,
      },
    };
  }

  async findOne(
    organizationId: string,
    id: string,
  ) {
    const lead =
      await this.prisma.lead.findFirst({
        where: {
          id,
          organizationId,
        },
      });

    if (!lead) {
      throw new NotFoundException(
        'Lead not found',
      );
    }

    return lead;
  }

  async update(
    organizationId: string,
    id: string,
    dto: UpdateLeadDto,
  ) {
    const existing =
      await this.findOne(
        organizationId,
        id,
      );

    const merged = {
      firstName:
        dto.firstName ??
        existing.firstName,

      lastName:
        dto.lastName ??
        existing.lastName,

      email:
        dto.email ??
        existing.email,

      phone:
        dto.phone ??
        existing.phone,

      company:
        dto.company ??
        existing.company,

      jobTitle:
        dto.jobTitle ??
        existing.jobTitle,

      website:
        dto.website ??
        existing.website,

      source:
        dto.source ??
        existing.source,
    };

    const identityKey =
      contactIdentityKey(
        merged.email,
        merged.phone,
        id,
      );

    return this.prisma.$transaction(
      async (tx) => {
        const contact =
          await tx.contact.upsert({
            where: {
              organizationId_identityKey: {
                organizationId,
                identityKey,
              },
            },

            create: {
              organizationId,
              identityKey,

              firstName:
                merged.firstName,

              lastName:
                merged.lastName,

              email:
                merged.email,

              phone:
                merged.phone,

              company:
                merged.company,

              jobTitle:
                merged.jobTitle,

              website:
                merged.website,

              source:
                merged.source,
            },

            update: {
              firstName:
                merged.firstName,

              lastName:
                merged.lastName,

              email:
                merged.email,

              phone:
                merged.phone,

              company:
                merged.company,

              jobTitle:
                merged.jobTitle,

              website:
                merged.website,

              source:
                merged.source,
            },

            select: {
              id: true,
            },
          });

        const updatedLead =
          await tx.lead.update({
            where: {
              id,
            },

            data: {
              ...dto,

              contactId:
                contact.id,

              ...(dto.currency && {
                currency:
                  dto.currency
                    .toUpperCase(),
              }),
            },
          });

        if (
          existing.contactId &&
          existing.contactId !==
            contact.id
        ) {
          const remaining =
            await tx.lead.count({
              where: {
                organizationId,

                contactId:
                  existing.contactId,
              },
            });

          if (
            remaining === 0
          ) {
            await tx.contact.delete({
              where: {
                id:
                  existing.contactId,
              },
            });
          }
        }

        return updatedLead;
      },
    );
  }

  async remove(
    organizationId: string,
    id: string,
  ) {
    const existing =
      await this.findOne(
        organizationId,
        id,
      );

    await this.prisma.$transaction(
      async (tx) => {
        await tx.lead.delete({
          where: {
            id,
          },
        });

        if (
          existing.contactId
        ) {
          const remaining =
            await tx.lead.count({
              where: {
                organizationId,

                contactId:
                  existing.contactId,
              },
            });

          if (
            remaining === 0
          ) {
            await tx.contact.delete({
              where: {
                id:
                  existing.contactId,
              },
            });
          }
        }
      },
    );

    return {
      success: true,
      message:
        'Lead deleted successfully',
    };
  }
}

