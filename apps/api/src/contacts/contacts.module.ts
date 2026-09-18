import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
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
    ContactsController,
  ],

  providers: [
    ContactsService,
  ],

  exports: [
    ContactsService,
  ],
})
export class ContactsModule {}