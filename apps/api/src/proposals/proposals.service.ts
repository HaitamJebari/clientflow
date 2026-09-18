import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  LeadStage,
  ProposalStatus,
} from '../generated/prisma/enums';

import {
  PrismaService,
} from '../prisma/prisma.service';

import {
  CreateProposalDto,
} from './dto/create-proposal.dto';

import {
  QueryProposalLeadOptionsDto,
} from './dto/query-proposal-lead-options.dto';

import {
  QueryProposalsDto,
} from './dto/query-proposals.dto';

import {
  UpdateProposalDto,
} from './dto/update-proposal.dto';

const proposalListSelect = {
  id: true,
  organizationId: true,
  leadId: true,
  contactId: true,

  title: true,
  status: true,

  amountCents: true,
  currency: true,

  validUntil: true,

  sentAt: true,
  viewedAt: true,
  acceptedAt: true,
  rejectedAt: true,

  viewCount: true,

  createdAt: true,
  updatedAt: true,

  lead: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      company: true,
      stage: true,
      valueCents: true,
      currency: true,
    },
  },

  contact: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      company: true,
    },
  },
} as const;

@Injectable()
export class ProposalsService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  async findLeadOptions(
    organizationId: string,

    query:
      QueryProposalLeadOptionsDto,
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
          company: true,

          stage: true,

          valueCents: true,
          currency: true,

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
      QueryProposalsDto,
  ) {
    const page =
      query.page ?? 1;

    const pageSize =
      query.pageSize ??
      20;

    const search =
      query.search
        ?.trim();

    const filter =
      query.filter ??
      'all';

    const sort =
      query.sort ??
      'recent';

    const where = {
      organizationId,

      ...(filter !==
      'all'
        ? {
            status:
              filter as
                ProposalStatus,
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                title: {
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
      sort === 'title'
        ? [
            {
              title:
                'asc' as const,
            },
          ]
        : sort ===
            'amount'
          ? [
              {
                amountCents:
                  'desc' as const,
              },

              {
                updatedAt:
                  'desc' as const,
              },
            ]
          : sort ===
              'status'
            ? [
                {
                  status:
                    'asc' as const,
                },

                {
                  updatedAt:
                    'desc' as const,
                },
              ]
            : [
                {
                  updatedAt:
                    'desc' as const,
                },
              ];

    const [
      total,
      proposals,
    ] =
      await Promise.all([
        this.prisma.proposal.count({
          where,
        }),

        this.prisma.proposal.findMany({
          where,

          select:
            proposalListSelect,

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
        proposals,

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
    const proposal =
      await this.prisma.proposal.findFirst({
        where: {
          id,
          organizationId,
        },

        include: {
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

              nextFollowUpAt:
                true,
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
              website: true,
            },
          },
        },
      });

    if (!proposal) {
      throw new NotFoundException(
        'Proposal not found',
      );
    }

    return proposal;
  }

  async create(
    organizationId: string,

    dto:
      CreateProposalDto,
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

          valueCents: true,
          currency: true,
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
        'A proposal can only be created for an open opportunity',
      );
    }

    const now =
      new Date();

    return this.prisma.$transaction(
      async (tx) => {
        const proposal =
          await tx.proposal.create({
            data: {
              organizationId,

              leadId:
                lead.id,

              contactId:
                lead.contactId,

              title:
                dto.title.trim(),

              amountCents:
                dto.amountCents ??
                lead.valueCents ??
                0,

              currency:
                dto.currency ??
                lead.currency ??
                'EUR',

              summary:
                dto.summary
                  ?.trim() ||
                null,

              scope:
                dto.scope
                  ?.trim() ||
                null,

              timeline:
                dto.timeline
                  ?.trim() ||
                null,

              terms:
                dto.terms
                  ?.trim() ||
                null,

              validUntil:
                dto.validUntil
                  ? new Date(
                      dto.validUntil,
                    )
                  : null,
            },

            include: {
              lead: true,
              contact: true,
            },
          });

        await tx.lead.update({
          where: {
            id:
              lead.id,
          },

          data: {
            stage:
              LeadStage.PROPOSAL,

            lastActivityAt:
              now,
          },
        });

        return proposal;
      },
    );
  }

  async update(
    organizationId: string,
    id: string,

    dto:
      UpdateProposalDto,
  ) {
    const proposal =
      await this.getOwnedProposal(
        organizationId,
        id,
      );

    if (
      proposal.status !==
      ProposalStatus.DRAFT
    ) {
      throw new BadRequestException(
        'Only draft proposals can be edited',
      );
    }

    return this.prisma.proposal.update({
      where: {
        id:
          proposal.id,
      },

      data: {
        ...(dto.title !==
        undefined
          ? {
              title:
                dto.title.trim(),
            }
          : {}),

        ...(dto.amountCents !==
        undefined
          ? {
              amountCents:
                dto.amountCents,
            }
          : {}),

        ...(dto.currency !==
        undefined
          ? {
              currency:
                dto.currency,
            }
          : {}),

        ...(dto.summary !==
        undefined
          ? {
              summary:
                dto.summary
                  ?.trim() ||
                null,
            }
          : {}),

        ...(dto.scope !==
        undefined
          ? {
              scope:
                dto.scope
                  ?.trim() ||
                null,
            }
          : {}),

        ...(dto.timeline !==
        undefined
          ? {
              timeline:
                dto.timeline
                  ?.trim() ||
                null,
            }
          : {}),

        ...(dto.terms !==
        undefined
          ? {
              terms:
                dto.terms
                  ?.trim() ||
                null,
            }
          : {}),

        ...(dto.validUntil !==
        undefined
          ? {
              validUntil:
                dto.validUntil
                  ? new Date(
                      dto.validUntil,
                    )
                  : null,
            }
          : {}),
      },
    });
  }

  async markSent(
    organizationId: string,
    id: string,
  ) {
    const proposal =
      await this.getOwnedProposal(
        organizationId,
        id,
      );

    if (
      proposal.status !==
        ProposalStatus.DRAFT
    ) {
      throw new BadRequestException(
        'Only a draft proposal can be marked as sent',
      );
    }

    const now =
      new Date();

    return this.prisma.$transaction(
      async (tx) => {
        const updated =
          await tx.proposal.update({
            where: {
              id:
                proposal.id,
            },

            data: {
              status:
                ProposalStatus.SENT,

              sentAt:
                now,
            },
          });

        await tx.lead.update({
          where: {
            id:
              proposal.leadId,
          },

          data: {
            stage:
              LeadStage.PROPOSAL,

            lastActivityAt:
              now,
          },
        });

        return updated;
      },
    );
  }

  async recordView(
    organizationId: string,
    id: string,
  ) {
    const proposal =
      await this.getOwnedProposal(
        organizationId,
        id,
      );

    if (
      proposal.status ===
        ProposalStatus.ACCEPTED ||
      proposal.status ===
        ProposalStatus.REJECTED
    ) {
      return proposal;
    }

    const now =
      new Date();

    return this.prisma.proposal.update({
      where: {
        id:
          proposal.id,
      },

      data: {
        status:
          ProposalStatus.VIEWED,

        viewedAt:
          now,

        viewCount: {
          increment: 1,
        },
      },
    });
  }

  async accept(
    organizationId: string,
    id: string,
  ) {
    const proposal =
      await this.getOwnedProposal(
        organizationId,
        id,
      );

    if (
      proposal.status ===
      ProposalStatus.ACCEPTED
    ) {
      return proposal;
    }

    if (
      proposal.status ===
      ProposalStatus.REJECTED
    ) {
      throw new BadRequestException(
        'A rejected proposal cannot be accepted without creating a new proposal',
      );
    }

    const now =
      new Date();

    return this.prisma.$transaction(
      async (tx) => {
        const updated =
          await tx.proposal.update({
            where: {
              id:
                proposal.id,
            },

            data: {
              status:
                ProposalStatus.ACCEPTED,

              acceptedAt:
                now,
            },
          });

        await tx.lead.update({
          where: {
            id:
              proposal.leadId,
          },

          data: {
            stage:
              LeadStage.WON,

            lastActivityAt:
              now,
          },
        });

        return updated;
      },
    );
  }

  async reject(
    organizationId: string,
    id: string,
  ) {
    const proposal =
      await this.getOwnedProposal(
        organizationId,
        id,
      );

    if (
      proposal.status ===
      ProposalStatus.REJECTED
    ) {
      return proposal;
    }

    if (
      proposal.status ===
      ProposalStatus.ACCEPTED
    ) {
      throw new BadRequestException(
        'An accepted proposal cannot be rejected',
      );
    }

    const now =
      new Date();

    /*
     * Rejection does not automatically mark the opportunity LOST.
     * A client can reject one proposal and still continue negotiating.
     */
    return this.prisma.$transaction(
      async (tx) => {
        const updated =
          await tx.proposal.update({
            where: {
              id:
                proposal.id,
            },

            data: {
              status:
                ProposalStatus.REJECTED,

              rejectedAt:
                now,
            },
          });

        await tx.lead.update({
          where: {
            id:
              proposal.leadId,
          },

          data: {
            lastActivityAt:
              now,
          },
        });

        return updated;
      },
    );
  }

  async remove(
    organizationId: string,
    id: string,
  ) {
    const proposal =
      await this.getOwnedProposal(
        organizationId,
        id,
      );

    if (
      proposal.status !==
      ProposalStatus.DRAFT
    ) {
      throw new BadRequestException(
        'Only draft proposals can be deleted',
      );
    }

    await this.prisma.proposal.delete({
      where: {
        id:
          proposal.id,
      },
    });

    return {
      success: true,
    };
  }

  private async getOwnedProposal(
    organizationId: string,
    id: string,
  ) {
    const proposal =
      await this.prisma.proposal.findFirst({
        where: {
          id,
          organizationId,
        },
      });

    if (!proposal) {
      throw new NotFoundException(
        'Proposal not found',
      );
    }

    return proposal;
  }
}
