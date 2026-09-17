import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  LeadStage,
} from '../../generated/prisma/enums';

import { PrismaService } from '../../prisma/prisma.service';

import {
  QueryContactsDto,
} from './dto/query-contacts.dto';

interface ContactListRow {
  id: string;

  firstName: string;
  lastName: string | null;

  email: string | null;
  phone: string | null;

  company: string | null;
  jobTitle: string | null;

  activeOpportunityCount: number;

  openValueCents: number;
  lifetimeValueCents: number;

  latestActivityAt: Date | null;

  totalCount: number;
}

interface ContactSummaryRow {
  totalContacts: number;
  activeContacts: number;
  clientContacts: number;
  lifetimeValueCents: number;
}

const contactOpportunitySelect = {
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

  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class ContactsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll(
    organizationId: string,
    query: QueryContactsDto,
  ) {
    const search =
      query.search?.trim() ?? '';

    const filter =
      query.filter ?? 'all';

    const sort =
      query.sort ?? 'recent';

    const page =
      query.page ?? 1;

    const pageSize =
      query.pageSize ?? 20;

    const offset =
      (page - 1) * pageSize;

    const params: unknown[] = [
      organizationId,
    ];

    let searchSql = '';

    if (search) {
      params.push(
        `%${search}%`,
      );

      const searchParameter =
        `$${params.length}`;

      searchSql = `
        AND (
          c."firstName" ILIKE ${searchParameter}
          OR c."lastName" ILIKE ${searchParameter}
          OR c."email" ILIKE ${searchParameter}
          OR c."phone" ILIKE ${searchParameter}
          OR c."company" ILIKE ${searchParameter}
          OR c."jobTitle" ILIKE ${searchParameter}
        )
      `;
    }

    const filterSql =
      filter === 'active'
        ? `
            WHERE "activeOpportunityCount" > 0
          `
        : filter === 'clients'
          ? `
              WHERE "lifetimeValueCents" > 0
            `
          : filter === 'inactive'
            ? `
                WHERE "activeOpportunityCount" = 0
              `
            : '';

    const orderSql =
      sort === 'name'
        ? `
            LOWER("firstName") ASC,
            LOWER(COALESCE("lastName", '')) ASC,
            "id" ASC
          `
        : sort === 'company'
          ? `
              LOWER(COALESCE("company", '')) ASC,
              LOWER("firstName") ASC,
              "id" ASC
            `
          : sort === 'value'
            ? `
                (
                  "openValueCents" +
                  "lifetimeValueCents"
                ) DESC,
                "latestActivityAt" DESC NULLS LAST,
                "id" ASC
              `
            : `
                "latestActivityAt" DESC NULLS LAST,
                "updatedAt" DESC,
                "id" ASC
              `;

    params.push(
      pageSize,
    );

    const limitParameter =
      `$${params.length}`;

    params.push(
      offset,
    );

    const offsetParameter =
      `$${params.length}`;

    const rows =
      await this.prisma.$queryRawUnsafe<
        ContactListRow[]
      >(
        `
          WITH contact_metrics AS (
            SELECT
              c."id",
              c."firstName",
              c."lastName",
              c."email",
              c."phone",
              c."company",
              c."jobTitle",
              c."updatedAt",

              COUNT(l."id") FILTER (
                WHERE
                  l."stage" NOT IN ('WON', 'LOST')
              )::int AS "activeOpportunityCount",

              COALESCE(
                SUM(l."valueCents") FILTER (
                  WHERE
                    l."stage" NOT IN ('WON', 'LOST')
                ),
                0
              )::double precision AS "openValueCents",

              COALESCE(
                SUM(l."valueCents") FILTER (
                  WHERE
                    l."stage" = 'WON'
                ),
                0
              )::double precision AS "lifetimeValueCents",

              MAX(
                COALESCE(
                  l."lastActivityAt",
                  l."updatedAt",
                  l."createdAt"
                )
              ) AS "latestActivityAt"

            FROM "contacts" c

            LEFT JOIN "leads" l
              ON
                l."contactId" = c."id"
                AND
                l."organizationId" = c."organizationId"

            WHERE
              c."organizationId" = $1

              ${searchSql}

            GROUP BY
              c."id"
          )

          SELECT
            "id",
            "firstName",
            "lastName",
            "email",
            "phone",
            "company",
            "jobTitle",
            "activeOpportunityCount",
            "openValueCents",
            "lifetimeValueCents",
            "latestActivityAt",

            (COUNT(*) OVER())::int AS "totalCount"

          FROM contact_metrics

          ${filterSql}

          ORDER BY
            ${orderSql}

          LIMIT ${limitParameter}
          OFFSET ${offsetParameter}
        `,
        ...params,
      );

    const total =
      rows[0]
        ? Number(
            rows[0].totalCount,
          )
        : 0;

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          total / pageSize,
        ),
      );

    return {
      data:
        rows.map(
          (row) => ({
            id:
              row.id,

            firstName:
              row.firstName,

            lastName:
              row.lastName ?? '',

            email:
              row.email ?? '',

            phone:
              row.phone ?? '',

            company:
              row.company ??
              'No company',

            jobTitle:
              row.jobTitle ?? '',

            activeOpportunityCount:
              Number(
                row.activeOpportunityCount,
              ),

            openValueCents:
              Number(
                row.openValueCents,
              ),

            lifetimeValueCents:
              Number(
                row.lifetimeValueCents,
              ),

            latestActivityAt:
              row.latestActivityAt,
          }),
        ),

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
    const rows =
      await this.prisma.$queryRawUnsafe<
        ContactSummaryRow[]
      >(
        `
          WITH contact_metrics AS (
            SELECT
              c."id",

              COUNT(l."id") FILTER (
                WHERE
                  l."stage" NOT IN ('WON', 'LOST')
              )::int AS "activeOpportunityCount",

              COALESCE(
                SUM(l."valueCents") FILTER (
                  WHERE
                    l."stage" = 'WON'
                ),
                0
              )::double precision AS "lifetimeValueCents"

            FROM "contacts" c

            LEFT JOIN "leads" l
              ON
                l."contactId" = c."id"
                AND
                l."organizationId" = c."organizationId"

            WHERE
              c."organizationId" = $1

            GROUP BY
              c."id"
          )

          SELECT
            COUNT(*)::int AS "totalContacts",

            COUNT(*) FILTER (
              WHERE
                "activeOpportunityCount" > 0
            )::int AS "activeContacts",

            COUNT(*) FILTER (
              WHERE
                "lifetimeValueCents" > 0
            )::int AS "clientContacts",

            COALESCE(
              SUM(
                "lifetimeValueCents"
              ),
              0
            )::double precision AS "lifetimeValueCents"

          FROM contact_metrics
        `,
        organizationId,
      );

    const summary =
      rows[0] ?? {
        totalContacts: 0,
        activeContacts: 0,
        clientContacts: 0,
        lifetimeValueCents: 0,
      };

    return {
      totalContacts:
        Number(
          summary.totalContacts,
        ),

      activeContacts:
        Number(
          summary.activeContacts,
        ),

      clientContacts:
        Number(
          summary.clientContacts,
        ),

      lifetimeValueCents:
        Number(
          summary.lifetimeValueCents,
        ),

      currency: 'EUR',
    };
  }

  async findOne(
    organizationId: string,
    id: string,
  ) {
    const contact =
      await this.prisma.contact.findFirst({
        where: {
          id,
          organizationId,
        },

        include: {
          leads: {
            orderBy: [
              {
                updatedAt:
                  'desc',
              },
            ],

            select:
              contactOpportunitySelect,
          },
        },
      });

    if (!contact) {
      throw new NotFoundException(
        'Contact not found',
      );
    }

    const opportunities =
      contact.leads;

    const activeOpportunities =
      opportunities.filter(
        (lead) =>
          lead.stage !==
            LeadStage.WON &&
          lead.stage !==
            LeadStage.LOST,
      );

    const wonOpportunities =
      opportunities.filter(
        (lead) =>
          lead.stage ===
          LeadStage.WON,
      );

    const openValueCents =
      activeOpportunities.reduce(
        (
          total,
          lead,
        ) =>
          total +
          (lead.valueCents ??
            0),
        0,
      );

    const lifetimeValueCents =
      wonOpportunities.reduce(
        (
          total,
          lead,
        ) =>
          total +
          (lead.valueCents ??
            0),
        0,
      );

    const latestActivityAt =
      opportunities
        .map(
          (lead) =>
            lead.lastActivityAt ??
            lead.updatedAt ??
            lead.createdAt,
        )
        .sort(
          (a, b) =>
            b.getTime() -
            a.getTime(),
        )[0] ??
      null;

    return {
      id:
        contact.id,

      firstName:
        contact.firstName,

      lastName:
        contact.lastName,

      email:
        contact.email,

      phone:
        contact.phone,

      company:
        contact.company,

      jobTitle:
        contact.jobTitle,

      website:
        contact.website,

      source:
        contact.source,

      activeOpportunityCount:
        activeOpportunities.length,

      opportunityCount:
        opportunities.length,

      openValueCents,
      lifetimeValueCents,
      latestActivityAt,

      opportunities,
    };
  }
}
