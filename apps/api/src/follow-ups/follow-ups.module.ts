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
  FollowUpsController,
} from './follow-ups.controller';

import {
  FollowUpsService,
} from './follow-ups.service';

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
    FollowUpsController,
  ],

  providers: [
    FollowUpsService,
  ],

  exports: [
    FollowUpsService,
  ],
})
export class FollowUpsModule {}
