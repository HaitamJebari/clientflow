import {
  Injectable,
} from '@nestjs/common';

import {
  LeadStage,
} from '../generated/prisma/enums';

import {
  PrismaService,
} from '../prisma/prisma.service';

interface DashboardStageRow {
  stage: LeadStage;
  count: number;
  totalValueCents: number;
  hotCount: number;
}

interface DashboardAttentionRow {
  id: string;

  firstName: string;
  lastName: string | null;

  company: string | null;

  stage: LeadStage;
  temperature:
    | 'HOT'
    | 'WARM'
    | 'COLD'
    | null;

  valueCents: number | null;
  currency: string;

  nextFollowUpAt: Date | null;
  lastActivityAt: Date | null;
  updatedAt: Date;

  aiNextBestAction: string | null;
}

const OPEN_STAGES = [
  LeadStage.NEW,
  LeadStage.CONTACTED,
  LeadStage.QUALIFIED,
  LeadStage.PROPOSAL,
  LeadStage.NEGOTIATION,
] as const;

const ALL_STAGES = [
  ...OPEN_STAGES,
  LeadStage.WON,
  LeadStage.LOST,
] as const;

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  async getOverview(
    organizationId: string,
  ) {
    /*
     * The dashboard intentionally uses two bounded database queries:
     *
     * 1. One grouped aggregate for every KPI + pipeline stage.
     * 2. One small query for at most three opportunities that actually
     *    need attention now.
     *
     * No full lead list is downloaded just to build dashboard metrics.
     */
    const [
      stageRows,
      attention,
    ] =
      await Promise.all([
        this.prisma.$queryRawUnsafe<
          DashboardStageRow[]
        >(
          `
            SELECT
              "stage"::text AS "stage",

              COUNT(*)::int AS "count",

              COALESCE(
                SUM("valueCents"),
                0
              )::double precision
                AS "totalValueCents",

              COUNT(*) FILTER (
                WHERE
                  "temperature" = 'HOT'
              )::int AS "hotCount"

            FROM "leads"

            WHERE
              "organizationId" = $1

            GROUP BY
              "stage"
          `,
          organizationId,
        ),

        this.prisma.$queryRawUnsafe<
          DashboardAttentionRow[]
        >(
          `
            SELECT
              "id",
              "firstName",
              "lastName",
              "company",

              "stage"::text
                AS "stage",

              "temperature"::text
                AS "temperature",

              "valueCents",
              "currency",

              "nextFollowUpAt",
              "lastActivityAt",
              "updatedAt",

              "aiNextBestAction"

            FROM "leads"

            WHERE
              "organizationId" = $1

              AND "stage" NOT IN (
                'WON',
                'LOST'
              )

              AND (
                "temperature" = 'HOT'

                OR (
                  "nextFollowUpAt"
                    IS NOT NULL

                  AND "nextFollowUpAt"
                    <= NOW()
                )
              )

            ORDER BY
              CASE
                WHEN
                  "nextFollowUpAt"
                    IS NOT NULL

                  AND "nextFollowUpAt"
                    <= NOW()

                THEN 0
                ELSE 1
              END,

              CASE
                WHEN "temperature" = 'HOT'
                  THEN 0

                WHEN "temperature" = 'WARM'
                  THEN 1

                ELSE 2
              END,

              "valueCents"
                DESC NULLS LAST,

              "updatedAt"
                DESC

            LIMIT 3
          `,
          organizationId,
        ),
      ]);

    const stageMap =
      new Map<
        LeadStage,
        {
          count: number;
          totalValueCents: number;
          hotCount: number;
        }
      >();

    for (
      const stage of
      ALL_STAGES
    ) {
      stageMap.set(
        stage,
        {
          count: 0,
          totalValueCents: 0,
          hotCount: 0,
        },
      );
    }

    for (
      const row of
      stageRows
    ) {
      stageMap.set(
        row.stage,
        {
          count:
            Number(
              row.count,
            ),

          totalValueCents:
            Number(
              row.totalValueCents,
            ),

          hotCount:
            Number(
              row.hotCount,
            ),
        },
      );
    }

    const stats = (
      stage: LeadStage,
    ) =>
      stageMap.get(
        stage,
      ) ?? {
        count: 0,
        totalValueCents: 0,
        hotCount: 0,
      };

    const activeLeadCount =
      OPEN_STAGES.reduce(
        (
          total,
          stage,
        ) =>
          total +
          stats(stage).count,
        0,
      );

    const hotActiveLeadCount =
      OPEN_STAGES.reduce(
        (
          total,
          stage,
        ) =>
          total +
          stats(stage).hotCount,
        0,
      );

    const openPipelineValueCents =
      OPEN_STAGES.reduce(
        (
          total,
          stage,
        ) =>
          total +
          stats(stage)
            .totalValueCents,
        0,
      );

    const won =
      stats(
        LeadStage.WON,
      );

    const lost =
      stats(
        LeadStage.LOST,
      );

    const closedCount =
      won.count +
      lost.count;

    const conversionRate =
      closedCount > 0
        ? Math.round(
            (
              won.count /
              closedCount
            ) * 100,
          )
        : null;

    return {
      metrics: {
        openPipelineValueCents,

        activeLeadCount,
        hotActiveLeadCount,

        conversionRate,
        closedCount,

        wonCount:
          won.count,

        wonRevenueCents:
          won.totalValueCents,

        currency: 'EUR',
      },

      pipelineStages:
        OPEN_STAGES.map(
          (stage) => ({
            stage,

            count:
              stats(stage)
                .count,

            totalValueCents:
              stats(stage)
                .totalValueCents,
          }),
        ),

      attention:
        attention.map(
          (lead) => ({
            ...lead,

            valueCents:
              lead.valueCents ??
              0,
          }),
        ),

      generatedAt:
        new Date(),
    };
  }
}
