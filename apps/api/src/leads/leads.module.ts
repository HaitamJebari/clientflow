import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    AuthModule,
    PrismaModule,

PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),


    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),
  ],

  controllers: [
    LeadsController,
  ],

  providers: [
    LeadsService,
  ],

  exports: [
    LeadsService,
  ],
})
export class LeadsModule {}