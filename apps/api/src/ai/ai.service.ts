import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Inject,
} from '@nestjs/common';

import {
  FollowUpStatus,
  LeadStage,
  LeadTemperature,
  ProposalStatus,
} from '../generated/prisma/enums';

import {
  PrismaService,
} from '../prisma/prisma.service';

import {
  GenerateFollowUpDto,
  GenerateFollowUpTone,
} from './dto/generate-follow-up.dto';

import {
  AI_PROVIDER,
} from './providers/ai-provider.interface';

import type {
  AiLeadContext,
  AiProvider,
} from './providers/ai-provider.interface';

@Injectable()
export class AiService {
  constructor(
    private readonly prisma:
      PrismaService,

    @Inject(
      AI_PROVIDER,
    )
    private readonly provider:
      AiProvider,
  ) {}

  async generateFollowUp(
    organizationId: string,

    dto:
      GenerateFollowUpDto,
  ) {
    const context =
      await this.buildContext(
        organizationId,
        dto.leadId,
      );

    const tone =
      dto.tone ??
      GenerateFollowUpTone.PROFESSIONAL;

    const result =
      await this.provider.generateFollowUp({
        context,

        tone,
      });

    return {
      leadId:
        dto.leadId,

      tone,

      ...result,

      generatedAt:
        new Date().toISOString(),
    };
  }

  async generateInsight(
    organizationId: string,
    leadId: string,
  ) {
    const context =
      await this.buildContext(
        organizationId,
        leadId,
      );

    const result =
      await this.provider.generateInsight(
        context,
      );

    /*
     * Store the latest AI analysis on the Lead so existing Lead detail
     * surfaces can reuse it without making another model call.
     *
     * This stores interpretation only. The deterministic pipeline data
     * remains the source of truth.
     */
    await this.prisma.lead.update({
      where: {
        id:
          leadId,
      },

      data: {
        aiSummary:
          result.summary,

        aiNextBestAction:
          result.nextBestAction,

        aiInformationConfidence:
          result.informationConfidence,

        aiRisks:
          result.risks,

        aiMissingInformation:
          result.missingInformation,

        aiUpdatedAt:
          new Date(),
      },
    });

    return {
      leadId,

      ...result,

      generatedAt:
        new Date().toISOString(),
    };
  }

  private async buildContext(
    organizationId: string,
    leadId: string,
  ): Promise<AiLeadContext> {
    const lead =
      await this.prisma.lead.findFirst({
        where: {
          id:
            leadId,

          organizationId,
        },

        select: {
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

          proposals: {
            orderBy: {
              updatedAt:
                'desc',
            },

            take: 3,

            select: {
              id: true,
              title: true,
              status: true,

              amountCents: true,
              currency: true,

              summary: true,
              scope: true,
              timeline: true,
              terms: true,

              validUntil: true,

              sentAt: true,
              viewedAt: true,

              viewCount: true,

              createdAt: true,
              updatedAt: true,
            },
          },

          followUps: {
            orderBy: {
              scheduledFor:
                'desc',
            },

            take: 5,

            select: {
              id: true,

              channel: true,
              status: true,

              scheduledFor: true,

              subject: true,
              draftMessage: true,
              reason: true,

              completedAt: true,

              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

    if (!lead) {
      throw new NotFoundException(
        'Lead not found',
      );
    }

    const signals =
      this.buildSignals(
        lead,
      );

    const deterministicAction =
      this.determineAction(
        lead,
      );

    return {
      lead: {
        ...lead,

        lastActivityAt:
          lead.lastActivityAt?.toISOString() ??
          null,

        lastContactedAt:
          lead.lastContactedAt?.toISOString() ??
          null,

        nextFollowUpAt:
          lead.nextFollowUpAt?.toISOString() ??
          null,

        createdAt:
          lead.createdAt.toISOString(),

        updatedAt:
          lead.updatedAt.toISOString(),
      },

      contact:
        lead.contact
          ? {
              ...lead.contact,
            }
          : null,

      proposals:
        lead.proposals.map(
          (
            proposal,
          ) => ({
            ...proposal,

            validUntil:
              proposal.validUntil?.toISOString() ??
              null,

            sentAt:
              proposal.sentAt?.toISOString() ??
              null,

            viewedAt:
              proposal.viewedAt?.toISOString() ??
              null,

            createdAt:
              proposal.createdAt.toISOString(),

            updatedAt:
              proposal.updatedAt.toISOString(),
          }),
        ),

      followUps:
        lead.followUps.map(
          (
            followUp,
          ) => ({
            ...followUp,

            scheduledFor:
              followUp.scheduledFor.toISOString(),

            completedAt:
              followUp.completedAt?.toISOString() ??
              null,

            createdAt:
              followUp.createdAt.toISOString(),

            updatedAt:
              followUp.updatedAt.toISOString(),
          }),
        ),

      signals,

      deterministicAction,
    };
  }

  private buildSignals(
    lead: {
      stage:
        LeadStage;

      temperature:
        LeadTemperature | null;

      lastActivityAt:
        Date | null;

      lastContactedAt:
        Date | null;

      nextFollowUpAt:
        Date | null;

      proposals: Array<{
        status:
          ProposalStatus;

        viewCount:
          number;

        viewedAt:
          Date | null;

        sentAt:
          Date | null;
      }>;

      followUps: Array<{
        status:
          FollowUpStatus;

        scheduledFor:
          Date;
      }>;
    },
  ) {
    const signals:
      string[] = [];

    const now =
      new Date();

    if (
      lead.temperature ===
      LeadTemperature.HOT
    ) {
      signals.push(
        'Opportunity is marked HOT.',
      );
    }

    if (
      lead.nextFollowUpAt &&
      lead.nextFollowUpAt <
        now
    ) {
      signals.push(
        'The next follow-up is overdue.',
      );
    }

    const pendingFollowUp =
      lead.followUps.find(
        (
          followUp,
        ) =>
          followUp.status ===
          FollowUpStatus.PENDING,
      );

    if (
      pendingFollowUp
    ) {
      signals.push(
        `A pending follow-up is scheduled for ${pendingFollowUp.scheduledFor.toISOString()}.`,
      );
    }

    const latestProposal =
      lead.proposals[0];

    if (
      latestProposal
    ) {
      signals.push(
        `Latest proposal status: ${latestProposal.status}.`,
      );

      if (
        latestProposal.viewCount >
        0
      ) {
        signals.push(
          `Latest proposal has ${latestProposal.viewCount} recorded view${
            latestProposal.viewCount ===
            1
              ? ''
              : 's'
          }.`,
        );
      }

      if (
        latestProposal.viewedAt
      ) {
        signals.push(
          `Latest proposal was last viewed at ${latestProposal.viewedAt.toISOString()}.`,
        );
      }

      if (
        latestProposal.sentAt
      ) {
        signals.push(
          `Latest proposal was sent at ${latestProposal.sentAt.toISOString()}.`,
        );
      }
    }

    if (
      lead.lastActivityAt
    ) {
      signals.push(
        `Last recorded activity: ${lead.lastActivityAt.toISOString()}.`,
      );
    }

    if (
      lead.lastContactedAt
    ) {
      signals.push(
        `Last recorded contact: ${lead.lastContactedAt.toISOString()}.`,
      );
    }

    return signals;
  }

  private determineAction(
    lead: {
      stage:
        LeadStage;

      temperature:
        LeadTemperature | null;

      nextFollowUpAt:
        Date | null;

      lastContactedAt:
        Date | null;

      proposals: Array<{
        status:
          ProposalStatus;

        viewCount:
          number;
      }>;

      followUps: Array<{
        status:
          FollowUpStatus;

        scheduledFor:
          Date;
      }>;
    },
  ) {
    const now =
      new Date();

    const overdueFollowUp =
      lead.followUps.find(
        (
          followUp,
        ) =>
          followUp.status ===
            FollowUpStatus.PENDING &&
          followUp.scheduledFor <
            now,
      );

    if (
      overdueFollowUp
    ) {
      return 'Complete the overdue follow-up now.';
    }

    const latestProposal =
      lead.proposals[0];

    if (
      latestProposal?.status ===
      ProposalStatus.VIEWED
    ) {
      return 'Follow up on the viewed proposal.';
    }

    if (
      latestProposal?.status ===
      ProposalStatus.SENT
    ) {
      return 'Check whether the client received and reviewed the proposal.';
    }

    if (
      lead.stage ===
      LeadStage.QUALIFIED &&
      !latestProposal
    ) {
      return 'Create and send a proposal.';
    }

    if (
      lead.stage ===
      LeadStage.NEGOTIATION
    ) {
      return 'Advance the negotiation and resolve the remaining blocker.';
    }

    if (
      lead.stage ===
        LeadStage.NEW &&
      !lead.lastContactedAt
    ) {
      return 'Make the first contact.';
    }

    if (
      lead.temperature ===
        LeadTemperature.HOT &&
      !lead.nextFollowUpAt
    ) {
      return 'Schedule the next follow-up.';
    }

    return 'Review the opportunity and define the next concrete sales step.';
  }
}
