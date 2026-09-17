import {
  Module,
} from '@nestjs/common';

import {
  PassportModule,
} from '@nestjs/passport';

import {
  PrismaModule,
} from '../../prisma/prisma.module';

import {
  ContactsController,
} from './contacts.controller';

import {
  ContactsService,
} from './contacts.service';

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
  ],

  providers: [
    LeadsService,
    ContactsService,
  ],

  exports: [
    LeadsService,
    ContactsService,
  ],
})
export class LeadsModule {}
