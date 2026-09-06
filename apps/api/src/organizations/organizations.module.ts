import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,

    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),
  ],

  controllers: [
    OrganizationsController,
  ],

  providers: [
    OrganizationsService,
  ],

  exports: [
    OrganizationsService,
  ],
})
export class OrganizationsModule {}