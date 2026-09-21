import {
  Module,
} from '@nestjs/common';

import {
  PassportModule,
} from '@nestjs/passport';

import {
  AuthModule,
} from '../auth/auth.module';

import {
  PrismaModule,
} from '../prisma/prisma.module';

import {
  AiController,
} from './ai.controller';

import {
  AiService,
} from './ai.service';

import {
  AI_PROVIDER,
} from './providers/ai-provider.interface';

import {
  LlmProvider,
} from './providers/llm.provider';

@Module({
  imports: [
    AuthModule,
    PrismaModule,

    PassportModule.register({
      defaultStrategy:
        'jwt',

      session:
        false,
    }),
  ],

  controllers: [
    AiController,
  ],

  providers: [
    AiService,
    LlmProvider,

    {
      provide:
        AI_PROVIDER,

      useExisting:
        LlmProvider,
    },
  ],

  exports: [
    AiService,
  ],
})
export class AiModule {}
