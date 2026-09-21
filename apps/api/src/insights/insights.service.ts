import {
  Injectable,
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

type InsightUrgency =
  | 'critical'
  | 'high'
  | 'medium';

type InsightActionType =
  | 'FOLLOW_UP'
  | 'CREATE_PROPOSAL'
  | 'FIRST_CONTACT'
  | 'ADVANCE_NEGOTIATION'
  | 'RE_ENGAGE';

interface RankedInsight {
  leadId: string;
  contactId: string | null;

  personName: string;
  company: string | null;
  email: string | null;

  stage: LeadStage;
  temperature: LeadTemperature | null;

  valueCents: number | null;
  currency: string;

  urgency: InsightUrgency;
  actionType: InsightActionType;

  action: string;
  whyNow: string;
  when: string;
  suggestedMessage: string;

  evidence: string[];
  missingInformation: string[];

  href: string;
  rank: number;
}

function hoursBetween(
  from: Date,
  to: Date,
) {
  return (
    to.getTime() -
    from.getTime()
  ) / 3_600_000;
}

function daysBetween(
  from: Date,
  to: Date,
) {
  return (
    to.getTime() -
    from.getTime()
  ) / 86_400_000;
}

function fullName(
  firstName: string,
  lastName: string | null,
) {
  return [
    firstName,
    lastName,
  ]
    .filter(Boolean)
    .join(' ');
}

@Injectable()
export class InsightsService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  async getOverview(
    organizationId: string,
  ) {
    const now =
      new Date();

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
        },

        select: {
          id: true,
          contactId: true,

          firstName: true,
          lastName: true,

          email: true,
          phone: true,

          company: true,

          stage: true,
          temperature: true,

          valueCents: true,
          currency: true,

          notes: true,

          lastActivityAt: true,
          lastContactedAt: true,

          createdAt: true,
          updatedAt: true,

          proposals: {
            where: {
              status: {
                notIn: [
                  ProposalStatus.ACCEPTED,
                  ProposalStatus.REJECTED,
                  ProposalStatus.EXPIRED,
                ],
              },
            },

            orderBy: {
              updatedAt:
                'desc',
            },

            take: 1,

            select: {
              id: true,
              status: true,

              sentAt: true,
              viewedAt: true,
              viewCount: true,

              updatedAt: true,
            },
          },

          followUps: {
            where: {
              status:
                FollowUpStatus.PENDING,
            },

            orderBy: {
              scheduledFor:
                'asc',
            },

            take: 1,

            select: {
              id: true,
              scheduledFor: true,
            },
          },
        },

        orderBy: {
          updatedAt:
            'desc',
        },

        take: 200,
      });

    const ranked =
      leads
        .map(
          (
            lead,
          ) =>
            this.buildInsight(
              lead,
              now,
            ),
        )
        .filter(
          (
            item,
          ):
            item is RankedInsight =>
            item !==
            null,
        )
        .sort(
          (
            a,
            b,
          ) =>
            b.rank -
              a.rank ||
            (
              b.valueCents ??
              0
            ) -
              (
                a.valueCents ??
                0
              ),
        );

    const queue =
      ranked
        .slice(
          0,
          20,
        )
        .map(
          ({
            rank: _rank,
            ...item
          }) =>
            item,
        );

    return {
      summary: {
        totalRecommendations:
          queue.length,

        criticalCount:
          queue.filter(
            (
              item,
            ) =>
              item.urgency ===
              'critical',
          ).length,

        highCount:
          queue.filter(
            (
              item,
            ) =>
              item.urgency ===
              'high',
          ).length,

        dueNowCount:
          queue.filter(
            (
              item,
            ) =>
              item.when ===
                'Now' ||
              item.when ===
                'Today',
          ).length,

        valueAtAttentionCents:
          queue.reduce(
            (
              total,
              item,
            ) =>
              total +
              (
                item.valueCents ??
                0
              ),
            0,
          ),

        currency:
          'EUR',
      },

      queue,

      generatedAt:
        now.toISOString(),

      methodology: {
        type:
          'deterministic-sales-signals',

        note:
          'Recommendations are ranked from live pipeline signals. They are not close-probability predictions.',
      },
    };
  }

  private buildInsight(
    lead: {
      id: string;
      contactId: string | null;

      firstName: string;
      lastName: string | null;

      email: string | null;
      phone: string | null;

      company: string | null;

      stage: LeadStage;
      temperature: LeadTemperature | null;

      valueCents: number | null;
      currency: string;

      notes: string | null;

      lastActivityAt: Date | null;
      lastContactedAt: Date | null;

      createdAt: Date;
      updatedAt: Date;

      proposals: Array<{
        id: string;
        status: ProposalStatus;

        sentAt: Date | null;
        viewedAt: Date | null;
        viewCount: number;

        updatedAt: Date;
      }>;

      followUps: Array<{
        id: string;
        scheduledFor: Date;
      }>;
    },

    now: Date,
  ):
    | RankedInsight
    | null {
    const proposal =
      lead.proposals[0] ??
      null;

    const followUp =
      lead.followUps[0] ??
      null;

    const personName =
      fullName(
        lead.firstName,
        lead.lastName,
      );

    const firstName =
      lead.firstName.trim() ||
      'there';

    const subjectName =
      lead.company ||
      personName;

    const missingInformation:
      string[] = [];

    if (!lead.email) {
      missingInformation.push(
        'Email address',
      );
    }

    if (!lead.phone) {
      missingInformation.push(
        'Phone number',
      );
    }

    if (
      lead.valueCents ===
      null
    ) {
      missingInformation.push(
        'Opportunity value',
      );
    }

    if (!lead.notes) {
      missingInformation.push(
        'Discovery notes',
      );
    }

    if (
      followUp &&
      followUp.scheduledFor <
        now
    ) {
      const overdueHours =
        Math.max(
          1,
          Math.round(
            Math.abs(
              hoursBetween(
                followUp.scheduledFor,
                now,
              ),
            ),
          ),
        );

      return {
        leadId:
          lead.id,

        contactId:
          lead.contactId,

        personName,
        company:
          lead.company,

        email:
          lead.email,

        stage:
          lead.stage,

        temperature:
          lead.temperature,

        valueCents:
          lead.valueCents,

        currency:
          lead.currency,

        urgency:
          'critical',

        actionType:
          'FOLLOW_UP',

        action:
          'Complete the overdue follow-up',

        whyNow:
          'A planned touchpoint has already passed. The active conversation risks losing momentum.',

        when:
          'Now',

        suggestedMessage:
          `Hi ${firstName}, just following up on our last conversation about ${subjectName}. I wanted to make sure you have everything you need from me and see if there are any questions I can clear up.`,

        evidence: [
          `Follow-up is ${overdueHours}h overdue`,
          ...(
            lead.temperature ===
            LeadTemperature.HOT
              ? [
                  'Opportunity is marked hot',
                ]
              : []
          ),
        ],

        missingInformation,

        href:
          '/follow-ups',

        rank:
          120 +
          (
            lead.temperature ===
            LeadTemperature.HOT
              ? 10
              : 0
          ),
      };
    }

    if (
      proposal?.status ===
      ProposalStatus.VIEWED
    ) {
      const viewedAt =
        proposal.viewedAt ??
        proposal.updatedAt;

      const daysSinceView =
        Math.max(
          0,
          Math.floor(
            daysBetween(
              viewedAt,
              now,
            ),
          ),
        );

      const views =
        Math.max(
          proposal.viewCount,
          1,
        );

      return {
        leadId:
          lead.id,

        contactId:
          lead.contactId,

        personName,
        company:
          lead.company,

        email:
          lead.email,

        stage:
          lead.stage,

        temperature:
          lead.temperature,

        valueCents:
          lead.valueCents,

        currency:
          lead.currency,

        urgency:
          daysSinceView >=
          2
            ? 'critical'
            : 'high',

        actionType:
          'FOLLOW_UP',

        action:
          'Follow up on the viewed proposal',

        whyNow:
          'The prospect has engaged with the proposal. This is a strong moment to surface questions while the offer is fresh.',

        when:
          daysSinceView >=
          1
            ? 'Today'
            : 'Within 24 hours',

        suggestedMessage:
          `Hi ${firstName}, I wanted to follow up on the proposal for ${subjectName}. If anything needs clarification around scope, timing or next steps, I’m happy to walk through it with you.`,

        evidence: [
          `Proposal viewed ${views} time${
            views === 1
              ? ''
              : 's'
          }`,
          ...(
            daysSinceView >
            0
              ? [
                  `${daysSinceView} day${
                    daysSinceView ===
                    1
                      ? ''
                      : 's'
                  } since latest view`,
                ]
              : []
          ),
        ],

        missingInformation,

        href:
          `/proposals/${proposal.id}`,

        rank:
          110 +
          Math.min(
            views,
            5,
          ),
      };
    }

    if (
      proposal?.status ===
      ProposalStatus.SENT
    ) {
      const sentAt =
        proposal.sentAt ??
        proposal.updatedAt;

      const daysSinceSent =
        Math.max(
          0,
          Math.floor(
            daysBetween(
              sentAt,
              now,
            ),
          ),
        );

      if (
        daysSinceSent >=
        2
      ) {
        return {
          leadId:
            lead.id,

          contactId:
            lead.contactId,

          personName,
          company:
            lead.company,

          email:
            lead.email,

          stage:
            lead.stage,

          temperature:
            lead.temperature,

          valueCents:
            lead.valueCents,

          currency:
            lead.currency,

          urgency:
            daysSinceSent >=
            4
              ? 'high'
              : 'medium',

          actionType:
            'FOLLOW_UP',

          action:
            'Check that the proposal reached the client',

          whyNow:
            'The proposal was sent but no proposal view has been recorded yet. A light check-in can confirm receipt without adding pressure.',

          when:
            'Today',

          suggestedMessage:
            `Hi ${firstName}, just checking that the proposal I sent for ${subjectName} reached you successfully. No rush — I’m happy to answer any questions whenever you’ve had a chance to review it.`,

          evidence: [
            `Proposal sent ${daysSinceSent} days ago`,
            'No recorded proposal view yet',
          ],

          missingInformation,

          href:
            `/proposals/${proposal.id}`,

          rank:
            90 +
            Math.min(
              daysSinceSent,
              10,
            ),
        };
      }
    }

    if (
      lead.stage ===
      LeadStage.NEGOTIATION
    ) {
      const reference =
        lead.lastActivityAt ??
        lead.updatedAt;

      const daysInactive =
        Math.max(
          0,
          Math.floor(
            daysBetween(
              reference,
              now,
            ),
          ),
        );

      if (
        daysInactive >=
        2
      ) {
        return {
          leadId:
            lead.id,

          contactId:
            lead.contactId,

          personName,
          company:
            lead.company,

          email:
            lead.email,

          stage:
            lead.stage,

          temperature:
            lead.temperature,

          valueCents:
            lead.valueCents,

          currency:
            lead.currency,

          urgency:
            daysInactive >=
            4
              ? 'high'
              : 'medium',

          actionType:
            'ADVANCE_NEGOTIATION',

          action:
            'Advance the negotiation',

          whyNow:
            'The deal is already in the closing stage, but activity has slowed. Resolve the remaining decision blocker before momentum drops further.',

          when:
            'Today',

          suggestedMessage:
            `Hi ${firstName}, I wanted to check in on the remaining points for ${subjectName}. Is there anything around scope, timing or terms that we should resolve before moving forward?`,

          evidence: [
            `${daysInactive} days without recorded activity`,
            'Opportunity is in negotiation',
          ],

          missingInformation,

          href:
            `/leads/${lead.id}`,

          rank:
            88 +
            Math.min(
              daysInactive,
              10,
            ),
        };
      }
    }

    if (
      lead.stage ===
        LeadStage.QUALIFIED &&
      !proposal
    ) {
      return {
        leadId:
          lead.id,

        contactId:
          lead.contactId,

        personName,
        company:
          lead.company,

        email:
          lead.email,

        stage:
          lead.stage,

        temperature:
          lead.temperature,

        valueCents:
          lead.valueCents,

        currency:
          lead.currency,

        urgency:
          lead.temperature ===
          LeadTemperature.HOT
            ? 'high'
            : 'medium',

        actionType:
          'CREATE_PROPOSAL',

        action:
          'Create the proposal',

        whyNow:
          'The opportunity is already qualified, so the next commercial step is to turn the agreed needs into a concrete offer.',

        when:
          lead.temperature ===
          LeadTemperature.HOT
            ? 'Today'
            : 'Within 48 hours',

        suggestedMessage:
          `Hi ${firstName}, thanks again for the conversation. I’ve got enough context to put the offer together for ${subjectName}. I’ll send the scope, timing and commercial details so you can review everything clearly.`,

        evidence: [
          'Opportunity is qualified',
          'No active proposal exists',
        ],

        missingInformation,

        href:
          `/proposals/new?leadId=${lead.id}`,

        rank:
          lead.temperature ===
          LeadTemperature.HOT
            ? 92
            : 82,
      };
    }

    if (
      lead.temperature ===
        LeadTemperature.HOT &&
      !followUp
    ) {
      return {
        leadId:
          lead.id,

        contactId:
          lead.contactId,

        personName,
        company:
          lead.company,

        email:
          lead.email,

        stage:
          lead.stage,

        temperature:
          lead.temperature,

        valueCents:
          lead.valueCents,

        currency:
          lead.currency,

        urgency:
          'high',

        actionType:
          'FOLLOW_UP',

        action:
          'Schedule the next follow-up',

        whyNow:
          'This is a high-priority opportunity, but there is no explicit next touchpoint scheduled.',

        when:
          'Today',

        suggestedMessage:
          `Hi ${firstName}, I wanted to keep the conversation moving on ${subjectName}. What would be most useful for the next step — a quick call, more detail on scope, or a concrete proposal?`,

        evidence: [
          'Opportunity is marked hot',
          'No pending follow-up is scheduled',
        ],

        missingInformation,

        href:
          '/follow-ups',

        rank:
          86,
      };
    }

    if (
      lead.stage ===
        LeadStage.NEW &&
      !lead.lastContactedAt
    ) {
      const ageHours =
        Math.max(
          0,
          Math.floor(
            hoursBetween(
              lead.createdAt,
              now,
            ),
          ),
        );

      return {
        leadId:
          lead.id,

        contactId:
          lead.contactId,

        personName,
        company:
          lead.company,

        email:
          lead.email,

        stage:
          lead.stage,

        temperature:
          lead.temperature,

        valueCents:
          lead.valueCents,

        currency:
          lead.currency,

        urgency:
          ageHours >=
          24
            ? 'high'
            : 'medium',

        actionType:
          'FIRST_CONTACT',

        action:
          'Make the first contact',

        whyNow:
          'New inquiries lose context quickly. A timely first response helps establish momentum while the original need is still current.',

        when:
          ageHours >=
          4
            ? 'Today'
            : 'Within a few hours',

        suggestedMessage:
          `Hi ${firstName}, thanks for reaching out. I’d like to understand what you’re trying to achieve with ${subjectName} and make sure I point you toward the right next step. Would a short call be convenient?`,

        evidence: [
          'Lead has not been contacted yet',
          `Created ${ageHours}h ago`,
        ],

        missingInformation,

        href:
          `/leads/${lead.id}`,

        rank:
          72 +
          Math.min(
            Math.floor(
              ageHours /
              12,
            ),
            12,
          ),
      };
    }

    if (
      lead.stage ===
      LeadStage.CONTACTED
    ) {
      const reference =
        lead.lastActivityAt ??
        lead.lastContactedAt ??
        lead.updatedAt;

      const daysInactive =
        Math.max(
          0,
          Math.floor(
            daysBetween(
              reference,
              now,
            ),
          ),
        );

      if (
        daysInactive >=
        3
      ) {
        return {
          leadId:
            lead.id,

          contactId:
            lead.contactId,

          personName,
          company:
            lead.company,

          email:
            lead.email,

          stage:
            lead.stage,

          temperature:
            lead.temperature,

          valueCents:
            lead.valueCents,

          currency:
            lead.currency,

          urgency:
            'medium',

          actionType:
            'RE_ENGAGE',

          action:
            'Re-engage the conversation',

          whyNow:
            'The conversation has started but has gone quiet before qualification. Re-open it with one clear question.',

          when:
            'This week',

          suggestedMessage:
            `Hi ${firstName}, I wanted to circle back on ${subjectName}. What is the main thing you still need to clarify before deciding whether to move ahead?`,

          evidence: [
            `${daysInactive} days without recorded activity`,
          ],

          missingInformation,

          href:
            `/leads/${lead.id}`,

          rank:
            60 +
            Math.min(
              daysInactive,
              15,
            ),
        };
      }
    }

    return null;
  }
}
