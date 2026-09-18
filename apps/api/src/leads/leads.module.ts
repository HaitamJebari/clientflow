import {
  Module,
} from '@nestjs/common';

import {
  PassportModule,
} from '@nestjs/passport';

import {
  PrismaModule,
} from '../prisma/prisma.module';

import {
  ContactsController,
} from '../contacts/contacts.controller';

import {
  DashboardController,
} from '../dashboard/dashboard.controller';

import {
  ContactsService,
} from '../contacts/contacts.service';

import {
  DashboardService,
} from '../dashboard/dashboard.service';

import {
  LeadsController,
} from './leads.controller';

import {
  LeadsService,
} from './leads.service';

@Module({
  imports: [
    PrismaModule,

    PassportModule.register({
      defaultStrategy:
        'jwt',
    }),
  ],

  controllers: [
    LeadsController,
    ContactsController,
    DashboardController,
  ],

  providers: [
    LeadsService,
    ContactsService,
    DashboardService,
  ],

  exports: [
    LeadsService,
    ContactsService,
  ],
})
export class LeadsModule {}
