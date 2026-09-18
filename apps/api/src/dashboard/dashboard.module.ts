import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    AuthModule,
    PrismaModule,

PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),
  ],

  controllers: [
    DashboardController,
  ],

  providers: [
    DashboardService,
  ],
})
export class DashboardModule {}