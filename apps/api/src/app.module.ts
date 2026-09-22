import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';

import { LeadsModule } from './leads/leads.module';
import { ContactsModule } from './contacts/contacts.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProposalsModule } from './proposals/proposals.module';
import { FollowUpsModule } from './follow-ups/follow-ups.module';
import { InsightsModule } from './insights/insights.module';
import { AiModule } from './ai/ai.module';
import { MembersModule } from './members/members.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),

    PrismaModule,
    HealthModule,

    AuthModule,
    UsersModule,
    OrganizationsModule,

    LeadsModule,
    ContactsModule,
    DashboardModule,
    ProposalsModule,
    FollowUpsModule,
    InsightsModule,
    AiModule,
    MembersModule,
  ],
})
export class AppModule {}
