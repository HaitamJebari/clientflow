import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  FollowUpStatus,
  LeadStage,
  LeadTemperature,
} from '../generated/prisma/enums';

import {
  PrismaService,
} from '../prisma/prisma.service';

import {
  CreateFollowUpDto,
} from './dto/create-follow-up.dto';

import {
  QueryFollowUpLeadOptionsDto,
} from './dto/query-follow-up-lead-options.dto';

import {
  QueryFollowUpsDto,
} from './dto/query-follow-ups.dto';

import {
  UpdateFollowUpDto,
} from './dto/update-follow-up.dto';

interface FollowUpSummaryRow {
  pendingCount: number;
  overdueCount: number;
  dueNext24HoursCount: number;
  upcoming7DaysCount: number;
  completedCount: number;
}

const followUpListSelect = {
  id: true,
  organizationId: true,
  leadId: true,
  contactId: true,

  channel: true,
  status: true,
  scheduledFor: true,

  subject: true,
  draftMessage: true,
  reason: true,

  completedAt: true,
  cancelledAt: true,

  createdAt: true,
  updatedAt: true,

  lead: {
    select: {
      id: true,

      firstName: true,
      lastName: true,

      email: true,
      phone: true,

      company: true,
      jobTitle: true,

      stage: true,
      temperature: true,
      qualification: true,

      valueCents: true,
      currency: true,

      nextFollowUpAt: true,
    },
  },

  contact: {
    select: {
      id: true,

      firstName: true,
      lastName: true,

      email: true,
      phone: true,

      company: true,
      jobTitle: true,
    },
  },
} as const;

@Injectable()
export class FollowUpsService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  async getSummary(
    organizationId: string,
  ) {
    const rows =
      await this.prisma.$queryRawUnsafe<
        FollowUpSummaryRow[]
      >(
        `
          SELECT
            COUNT(*) FILTER (
              WHERE "status" = 'PENDING'
            )::int AS "pendingCount",

            COUNT(*) FILTER (
              WHERE
                "status" = 'PENDING'
                AND "scheduledFor" < NOW()
            )::int AS "overdueCount",

            COUNT(*) FILTER (
              WHERE
                "status" = 'PENDING'
                AND "scheduledFor" >= NOW()
                AND "scheduledFor" < NOW() + INTERVAL '24 hours'
            )::int AS "dueNext24HoursCount",

            COUNT(*) FILTER (
              WHERE
                "status" = 'PENDING'
                AND "scheduledFor" >= NOW()
                AND "scheduledFor" < NOW() + INTERVAL '7 days'
            )::int AS "upcoming7DaysCount",

            COUNT(*) FILTER (
              WHERE "status" = 'COMPLETED'
            )::int AS "completedCount"

          FROM "follow_ups"

          WHERE "organizationId" = $1
        `,
        organizationId,
      );

    const summary =
      rows[0] ?? {
        pendingCount: 0,
        overdueCount: 0,
        dueNext24HoursCount: 0,
        upcoming7DaysCount: 0,
        completedCount: 0,
      };

    return {
      pendingCount:
        Number(
          summary.pendingCount,
        ),

      overdueCount:
        Number(
          summary.overdueCount,
        ),

      dueNext24HoursCount:
        Number(
          summary.dueNext24HoursCount,
        ),

      upcoming7DaysCount:
        Number(
          summary.upcoming7DaysCount,
        ),

      completedCount:
        Number(
          summary.completedCount,
        ),
    };
  }

  async findLeadOptions(
    organizationId: string,

    query:
      QueryFollowUpLeadOptionsDto,
  ) {
    const search =
      query.search
        ?.trim();

    const leads =
      await this.prisma.lead.findMany({
        where: {
          organizationId,

          stage: {
            notIn: [
              LeadStage.WON,
              LeadStage.LOST,
            ],
          },

          ...(search
            ? {
                OR: [
                  {
                    firstName: {
                      contains:
                        search,
                      mode:
                        'insensitive',
                    },
                  },

                  {
                    lastName: {
                      contains:
                        search,
                      mode:
                        'insensitive',
                    },
                  },

                  {
                    email: {
                      contains:
                        search,
                      mode:
                        'insensitive',
                    },
                  },

                  {
                    company: {
                      contains:
                        search,
                      mode:
                        'insensitive',
                    },
                  },
                ],
              }
            : {}),
        },

        select: {
          id: true,
          contactId: true,

          firstName: true,
          lastName: true,

          email: true,
          phone: true,

          company: true,
          jobTitle: true,

          stage: true,
          temperature: true,

          valueCents: true,
          currency: true,

          nextFollowUpAt: true,

          updatedAt: true,
        },

        orderBy: [
          {
            updatedAt:
              'desc',
          },
        ],

        take: 50,
      });

    return {
      data: leads,
    };
  }

  async findAll(
    organizationId: string,

    query:
      QueryFollowUpsDto,
  ) {
    const page =
      query.page ?? 1;

    const pageSize =
      query.pageSize ??
      20;

    const filter =
      query.filter ??
      'pending';

    const sort =
      query.sort ??
      'due';

    const search =
      query.search
        ?.trim();

    const now =
      new Date();

    const where = {
      organizationId,

      ...(filter ===
      'pending'
        ? {
            status:
              FollowUpStatus.PENDING,
          }
        : {}),

      ...(filter ===
      'overdue'
        ? {
            status:
              FollowUpStatus.PENDING,

            scheduledFor: {
              lt: now,
            },
          }
        : {}),

      ...(filter ===
      'completed'
        ? {
            status:
              FollowUpStatus.COMPLETED,
          }
        : {}),

      ...(filter ===
      'cancelled'
        ? {
            status:
              FollowUpStatus.CANCELLED,
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                subject: {
                  contains:
                    search,
                  mode:
                    'insensitive' as const,
                },
              },

              {
                reason: {
                  contains:
                    search,
                  mode:
                    'insensitive' as const,
                },
              },

              {
                draftMessage: {
                  contains:
                    search,
                  mode:
                    'insensitive' as const,
                },
              },

              {
                lead: {
                  is: {
                    OR: [
                      {
                        firstName: {
                          contains:
                            search,
                          mode:
                            'insensitive' as const,
                        },
                      },

                      {
                        lastName: {
                          contains:
                            search,
                          mode:
                            'insensitive' as const,
                        },
                      },

                      {
                        email: {
                          contains:
                            search,
                          mode:
                            'insensitive' as const,
                        },
                      },

                      {
                        company: {
                          contains:
                            search,
                          mode:
                            'insensitive' as const,
                        },
                      },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };

    const orderBy =
      sort === 'recent'
        ? [
            {
              updatedAt:
                'desc' as const,
            },
          ]
        : sort === 'client'
          ? [
              {
                lead: {
                  firstName:
                    'asc' as const,
                },
              },

              {
                scheduledFor:
                  'asc' as const,
              },
            ]
          : [
              {
                scheduledFor:
                  'asc' as const,
              },

              {
                updatedAt:
                  'desc' as const,
              },
            ];

    const [
      total,
      followUps,
    ] =
      await Promise.all([
        this.prisma.followUp.count({
          where,
        }),

        this.prisma.followUp.findMany({
          where,

          select:
            followUpListSelect,

          orderBy,

          skip:
            (page - 1) *
            pageSize,

          take:
            pageSize,
        }),
      ]);

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          total /
            pageSize,
        ),
      );

    return {
      data:
        followUps,

      meta: {
        page,
        pageSize,
        total,
        totalPages,

        hasPreviousPage:
          page > 1,

        hasNextPage:
          page <
          totalPages,
      },
    };
  }

  async findOne(
    organizationId: string,
    id: string,
  ) {
    const followUp =
      await this.prisma.followUp.findFirst({
        where: {
          id,
          organizationId,
        },

        select:
          followUpListSelect,
      });

    if (!followUp) {
      throw new NotFoundException(
        'Follow-up not found',
      );
    }

    return followUp;
  }

  async create(
    organizationId: string,

    dto:
      CreateFollowUpDto,
  ) {
    const lead =
      await this.prisma.lead.findFirst({
        where: {
          id:
            dto.leadId,

          organizationId,
        },

        select: {
          id: true,
          contactId: true,

          stage: true,
          temperature: true,

          firstName: true,
          company: true,
        },
      });

    if (!lead) {
      throw new NotFoundException(
        'Lead not found',
      );
    }

    if (
      lead.stage ===
        LeadStage.WON ||
      lead.stage ===
        LeadStage.LOST
    ) {
      throw new BadRequestException(
        'Follow-ups can only be scheduled for open opportunities',
      );
    }

    const scheduledFor =
      new Date(
        dto.scheduledFor,
      );

    const reason =
      dto.reason
        ?.trim() ||
      this.defaultReason(
        lead.stage,
        lead.temperature,
      );

    return this.prisma.$transaction(
      async (tx) => {
        const followUp =
          await tx.followUp.create({
            data: {
              organizationId,

              leadId:
                lead.id,

              contactId:
                lead.contactId,

              channel:
                dto.channel,

              scheduledFor,

              subject:
                dto.subject
                  ?.trim() ||
                null,

              draftMessage:
                dto.draftMessage
                  ?.trim() ||
                null,

              reason,
            },

            select:
              followUpListSelect,
          });

        await this.syncLeadNextFollowUp(
          tx,
          organizationId,
          lead.id,
        );

        return followUp;
      },
    );
  }

  async update(
    organizationId: string,
    id: string,

    dto:
      UpdateFollowUpDto,
  ) {
    const existing =
      await this.getOwnedFollowUp(
        organizationId,
        id,
      );

    if (
      existing.status !==
      FollowUpStatus.PENDING
    ) {
      throw new BadRequestException(
        'Only pending follow-ups can be edited',
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        const updated =
          await tx.followUp.update({
            where: {
              id:
                existing.id,
            },

            data: {
              ...(dto.channel !==
              undefined
                ? {
                    channel:
                      dto.channel,
                  }
                : {}),

              ...(dto.scheduledFor !==
              undefined
                ? {
                    scheduledFor:
                      new Date(
                        dto.scheduledFor,
                      ),
                  }
                : {}),

              ...(dto.subject !==
              undefined
                ? {
                    subject:
                      dto.subject
                        ?.trim() ||
                      null,
                  }
                : {}),

              ...(dto.draftMessage !==
              undefined
                ? {
                    draftMessage:
                      dto.draftMessage
                        ?.trim() ||
                      null,
                  }
                : {}),

              ...(dto.reason !==
              undefined
                ? {
                    reason:
                      dto.reason
                        ?.trim() ||
                      null,
                  }
                : {}),
            },

            select:
              followUpListSelect,
          });

        await this.syncLeadNextFollowUp(
          tx,
          organizationId,
          existing.leadId,
        );

        return updated;
      },
    );
  }

  async complete(
    organizationId: string,
    id: string,
  ) {
    const existing =
      await this.getOwnedFollowUp(
        organizationId,
        id,
      );

    if (
      existing.status !==
      FollowUpStatus.PENDING
    ) {
      throw new BadRequestException(
        'Only pending follow-ups can be completed',
      );
    }

    const now =
      new Date();

    return this.prisma.$transaction(
      async (tx) => {
        const updated =
          await tx.followUp.update({
            where: {
              id:
                existing.id,
            },

            data: {
              status:
                FollowUpStatus.COMPLETED,

              completedAt:
                now,

              cancelledAt:
                null,
            },

            select:
              followUpListSelect,
          });

        await tx.lead.update({
          where: {
            id:
              existing.leadId,
          },

          data: {
            lastContactedAt:
              now,

            lastActivityAt:
              now,
          },
        });

        await this.syncLeadNextFollowUp(
          tx,
          organizationId,
          existing.leadId,
        );

        return updated;
      },
    );
  }

  async cancel(
    organizationId: string,
    id: string,
  ) {
    const existing =
      await this.getOwnedFollowUp(
        organizationId,
        id,
      );

    if (
      existing.status !==
      FollowUpStatus.PENDING
    ) {
      throw new BadRequestException(
        'Only pending follow-ups can be cancelled',
      );
    }

    const now =
      new Date();

    return this.prisma.$transaction(
      async (tx) => {
        const updated =
          await tx.followUp.update({
            where: {
              id:
                existing.id,
            },

            data: {
              status:
                FollowUpStatus.CANCELLED,

              cancelledAt:
                now,

              completedAt:
                null,
            },

            select:
              followUpListSelect,
          });

        await this.syncLeadNextFollowUp(
          tx,
          organizationId,
          existing.leadId,
        );

        return updated;
      },
    );
  }

  async remove(
    organizationId: string,
    id: string,
  ) {
    const existing =
      await this.getOwnedFollowUp(
        organizationId,
        id,
      );

    if (
      existing.status !==
      FollowUpStatus.PENDING
    ) {
      throw new BadRequestException(
        'Only pending follow-ups can be deleted',
      );
    }

    await this.prisma.$transaction(
      async (tx) => {
        await tx.followUp.delete({
          where: {
            id:
              existing.id,
          },
        });

        await this.syncLeadNextFollowUp(
          tx,
          organizationId,
          existing.leadId,
        );
      },
    );

    return {
      success: true,
    };
  }

  private async getOwnedFollowUp(
    organizationId: string,
    id: string,
  ) {
    const followUp =
      await this.prisma.followUp.findFirst({
        where: {
          id,
          organizationId,
        },
      });

    if (!followUp) {
      throw new NotFoundException(
        'Follow-up not found',
      );
    }

    return followUp;
  }

  private defaultReason(
    stage: LeadStage,

    temperature:
      | LeadTemperature
      | null,
  ) {
    if (
      stage ===
      LeadStage.PROPOSAL
    ) {
      return 'Proposal follow-up';
    }

    if (
      stage ===
      LeadStage.NEGOTIATION
    ) {
      return 'Keep negotiation moving';
    }

    if (
      temperature ===
      LeadTemperature.HOT
    ) {
      return 'High-priority opportunity';
    }

    if (
      stage ===
      LeadStage.QUALIFIED
    ) {
      return 'Move qualified opportunity forward';
    }

    return 'Scheduled follow-up';
  }

  private async syncLeadNextFollowUp(
    tx: any,
    organizationId: string,
    leadId: string,
  ) {
    const next =
      await tx.followUp.findFirst({
        where: {
          organizationId,
          leadId,

          status:
            FollowUpStatus.PENDING,
        },

        orderBy: {
          scheduledFor:
            'asc',
        },

        select: {
          scheduledFor:
            true,
        },
      });

    await tx.lead.update({
      where: {
        id:
          leadId,
      },

      data: {
        nextFollowUpAt:
          next?.scheduledFor ??
          null,
      },
    });
  }
}
