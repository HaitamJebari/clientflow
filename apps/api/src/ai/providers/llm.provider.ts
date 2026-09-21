import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

import OpenAI from 'openai';

import {
  buildFollowUpPrompt,
} from '../prompts/follow-up.prompt';

import {
  buildOpportunitySummaryPrompt,
} from '../prompts/opportunity-summary.prompt';

import type {
  AiFollowUpResult,
  AiInsightResult,
  AiLeadContext,
  AiProvider,
  GenerateFollowUpInput,
} from './ai-provider.interface';

const followUpSchema = {
  type:
    'object',

  additionalProperties:
    false,

  properties: {
    subject: {
      type:
        'string',
    },

    summary: {
      type:
        'string',
    },

    whyNow: {
      type:
        'string',
    },

    suggestedMessage: {
      type:
        'string',
    },

    missingInformation: {
      type:
        'array',

      items: {
        type:
          'string',
      },
    },
  },

  required: [
    'subject',
    'summary',
    'whyNow',
    'suggestedMessage',
    'missingInformation',
  ],
} as const;

const insightSchema = {
  type:
    'object',

  additionalProperties:
    false,

  properties: {
    summary: {
      type:
        'string',
    },

    whyNow: {
      type:
        'string',
    },

    nextBestAction: {
      type:
        'string',
    },

    risks: {
      type:
        'array',

      items: {
        type:
          'string',
      },
    },

    missingInformation: {
      type:
        'array',

      items: {
        type:
          'string',
      },
    },

    informationConfidence: {
      type:
        'integer',

      minimum:
        0,

      maximum:
        100,
    },
  },

  required: [
    'summary',
    'whyNow',
    'nextBestAction',
    'risks',
    'missingInformation',
    'informationConfidence',
  ],
} as const;

@Injectable()
export class LlmProvider
  implements
    AiProvider
{
  private openai:
    OpenAI | null =
    null;

  private getClient() {
    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new ServiceUnavailableException(
        'AI is not configured. OPENAI_API_KEY is missing.',
      );
    }

    if (!this.openai) {
      this.openai =
        new OpenAI({
          apiKey,
        });
    }

    return this.openai;
  }

  private getModel() {
    return (
      process.env.AI_MODEL ??
      'gpt-5.6-luna'
    );
  }

  async generateFollowUp(
    input:
      GenerateFollowUpInput,
  ): Promise<AiFollowUpResult> {
    const client =
      this.getClient();

    const response =
      await client.responses.create({
        model:
          this.getModel(),

        store:
          false,

        input:
          buildFollowUpPrompt(
            input,
          ),

        text: {
          format: {
            type:
              'json_schema',

            name:
              'clientflow_follow_up',

            strict:
              true,

            schema:
              followUpSchema,
          },
        },

        max_output_tokens:
          1200,
      });

    return this.parseJson<
      AiFollowUpResult
    >(
      response.output_text,
      'follow-up draft',
    );
  }

  async generateInsight(
    context:
      AiLeadContext,
  ): Promise<AiInsightResult> {
    const client =
      this.getClient();

    const response =
      await client.responses.create({
        model:
          this.getModel(),

        store:
          false,

        input:
          buildOpportunitySummaryPrompt(
            context,
          ),

        text: {
          format: {
            type:
              'json_schema',

            name:
              'clientflow_opportunity_insight',

            strict:
              true,

            schema:
              insightSchema,
          },
        },

        max_output_tokens:
          1600,
      });

    const result =
      this.parseJson<
        AiInsightResult
      >(
        response.output_text,
        'opportunity insight',
      );

    result.informationConfidence =
      Math.max(
        0,
        Math.min(
          100,
          Math.round(
            result.informationConfidence,
          ),
        ),
      );

    return result;
  }

  private parseJson<T>(
    value: string,
    label: string,
  ): T {
    if (!value) {
      throw new ServiceUnavailableException(
        `AI returned an empty ${label}.`,
      );
    }

    try {
      return JSON.parse(
        value,
      ) as T;
    } catch {
      throw new ServiceUnavailableException(
        `AI returned an invalid ${label}.`,
      );
    }
  }
}
