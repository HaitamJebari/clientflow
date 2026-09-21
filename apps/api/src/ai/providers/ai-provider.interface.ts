export type AiTone =
  | 'professional'
  | 'friendly'
  | 'short'
  | 'direct'
  | 'warm';

export interface AiLeadContext {
  lead: {
    id: string;

    firstName: string;
    lastName: string | null;

    email: string | null;
    phone: string | null;

    company: string | null;
    jobTitle: string | null;
    website: string | null;

    source: string | null;

    stage: string;
    temperature: string | null;
    qualification: string;

    valueCents: number | null;
    currency: string;

    notes: string | null;

    lastActivityAt: string | null;
    lastContactedAt: string | null;
    nextFollowUpAt: string | null;

    createdAt: string;
    updatedAt: string;
  };

  contact: {
    id: string;

    firstName: string;
    lastName: string | null;

    email: string | null;
    phone: string | null;

    company: string | null;
    jobTitle: string | null;
  } | null;

  proposals: Array<{
    id: string;
    title: string;
    status: string;

    amountCents: number;
    currency: string;

    summary: string | null;
    scope: string | null;
    timeline: string | null;
    terms: string | null;

    validUntil: string | null;

    sentAt: string | null;
    viewedAt: string | null;

    viewCount: number;

    createdAt: string;
    updatedAt: string;
  }>;

  followUps: Array<{
    id: string;

    channel: string;
    status: string;

    scheduledFor: string;

    subject: string | null;
    draftMessage: string | null;
    reason: string | null;

    completedAt: string | null;

    createdAt: string;
    updatedAt: string;
  }>;

  signals: string[];

  deterministicAction: string;
}

export interface GenerateFollowUpInput {
  context: AiLeadContext;

  tone: AiTone;
}

export interface AiFollowUpResult {
  subject: string;

  summary: string;

  whyNow: string;

  suggestedMessage: string;

  missingInformation: string[];
}

export interface AiInsightResult {
  summary: string;

  whyNow: string;

  nextBestAction: string;

  risks: string[];

  missingInformation: string[];

  informationConfidence: number;
}

export interface AiProvider {
  generateFollowUp(
    input: GenerateFollowUpInput,
  ): Promise<AiFollowUpResult>;

  generateInsight(
    context: AiLeadContext,
  ): Promise<AiInsightResult>;
}

export const AI_PROVIDER =
  Symbol('AI_PROVIDER');
