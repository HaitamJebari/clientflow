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
  InsightsController,
} from './insights.controller';

import {
  InsightsService,
} from './insights.service';

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
    InsightsController,
  ],

  providers: [
    InsightsService,
  ],

  exports: [
    InsightsService,
  ],
})
export class InsightsModule {}
