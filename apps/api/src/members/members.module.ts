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
  MembersController,
} from './members.controller';

import {
  MembersService,
} from './members.service';

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
    MembersController,
  ],

  providers: [
    MembersService,
  ],
})
export class MembersModule {}
