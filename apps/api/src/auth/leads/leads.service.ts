import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  LeadStage,
  LeadTemperature,
} from '../../generated/prisma/enums';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateLeadDto } from './dto/create-lead.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    organizationId: string,
    dto: CreateLeadDto,
  ) {
    return this.prisma.lead.create({
      data: {
        organizationId,
        ...dto,
        currency:
          dto.currency?.toUpperCase() ??
          'EUR',
      },
    });
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

    const where = {
      organizationId,

      ...(search
        ? {
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
          }
        : {}),

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

    const activeWhere = {
      organizationId,

      stage: {
        notIn: [
          LeadStage.WON,
          LeadStage.LOST,
        ],
      },
    };

    const attentionWhere = {
      ...activeWhere,

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
    };

    const [
      leads,
      total,
      activeCount,
      attentionCount,
      potentialValue,
    ] =
      await this.prisma.$transaction([
        this.prisma.lead.findMany({
          where,
          orderBy,
          skip,
          take: pageSize,
        }),

        this.prisma.lead.count({
          where,
        }),

        this.prisma.lead.count({
          where: activeWhere,
        }),

        this.prisma.lead.count({
          where: attentionWhere,
        }),

        this.prisma.lead.aggregate({
          where: activeWhere,

          _sum: {
            valueCents: true,
          },
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

      summary: {
        activeCount,
        attentionCount,
        potentialValueCents:
          potentialValue
            ._sum
            .valueCents ?? 0,
        currency: 'EUR',
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
    await this.findOne(
      organizationId,
      id,
    );

    return this.prisma.lead.update({
      where: {
        id,
      },

      data: {
        ...dto,

        ...(dto.currency && {
          currency:
            dto.currency.toUpperCase(),
        }),
      },
    });
  }

  async remove(
    organizationId: string,
    id: string,
  ) {
    await this.findOne(
      organizationId,
      id,
    );

    await this.prisma.lead.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message:
        'Lead deleted successfully',
    };
  }
}
